// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const { pool } = require("../config/database");
const logger = require("../utils/logger");
const { authenticateToken } = require("../middleware/auth");
const { authenticateResetToken } = require("../middleware/resetAuth");
const { sendOtpEmail } = require("../utils/mailer");

const router = express.Router();

/* ===========================
 * 1) VALIDATIONS (primero)
 * =========================== */
const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("age").optional().isInt({ min: 13, max: 100 }).withMessage("Age must be between 13 and 100"),
  body("education_level").optional().isIn(["secundaria", "bachillerato", "tecnico", "universitario", "posgrado"]),
  body("location").optional().trim().isLength({ max: 100 }),
  body("interests").optional().trim().isLength({ max: 500 }),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
];

const verifyOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("code").isString().isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
];

const resetWithOtpValidation = [
  body("new_password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

/* ===========================
 * 2) RATE LIMITERS (después)
 * =========================== */

// Global auth limiter (register u otros)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || "").toLowerCase().trim()}`,
});

// Login limiter separado (más permisivo en dev)
const loginStore = new rateLimit.MemoryStore();
const loginLimiter = rateLimit({
  store: loginStore,
  windowMs: process.env.NODE_ENV === "production" ? 15 * 60 * 1000 : 30 * 1000,
  max: process.env.NODE_ENV === "production" ? Number(process.env.LOGIN_RATE_LIMIT_MAX || 20) : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || "").toLowerCase().trim()}`,
  skip: (req) => req.method === "OPTIONS" || req.originalUrl?.includes("/api/health"),
  requestWasSuccessful: (req, res) => res.statusCode < 400,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
      retryAfter: res.getHeader("Retry-After") || 60,
    });
  },
});

// OTP limiters
const forgotOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many reset requests, please try again later." },
});
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});
const resetWithOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});

/* ======================================
 * 3) ROUTES (al final, usan lo anterior)
 * ====================================== */

// 🧍 REGISTER
router.post("/register", authLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
    }

    const { name, email, password, age, location, education_level, interests } = req.body;

    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, age, location, education_level, interests, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', NOW())`,
      [name, email, hashedPassword, age || null, location || null, education_level || null, interests || null]
    );

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: result.insertId, name, email, role: "user" },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 🔐 LOGIN
router.post("/login", loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
    }

    const email = (req.body.email || "").toLowerCase().trim();
    const { password } = req.body;

    const [users] = await pool.execute("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    logger.info(`User logged in: ${email}`);
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        location: user.location,
        education_level: user.education_level,
        interests: user.interests,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 🔎 VERIFY TOKEN
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, role, age, education_level, location, interests, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: users[0] });
  } catch (error) {
    logger.error("Token verification error:", error);
    res.status(500).json({ error: "Token verification failed" });
  }
});

// 🔁 REFRESH TOKEN
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );
    res.json({ token });
  } catch (error) {
    logger.error("Token refresh error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// 🚪 LOGOUT
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/* =========================================
 * NUEVO SISTEMA DE RECUPERACIÓN CON OTP
 * ========================================= */

// 1) Generar y enviar OTP
router.post("/forgot-password-otp", forgotOtpLimiter, forgotOtpValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email } = req.body;
    const [users] = await pool.execute("SELECT id, email FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1", [email]);

    if (users.length === 0) return res.json({ success: true, message: "If the email exists, a code will be sent." });

    const user = users[0];

    // Invalida OTPs previos
    await pool.execute("DELETE FROM password_reset_otps WHERE user_id = ? AND used_at IS NULL", [user.id]);

    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const ttl = Number(process.env.RESET_OTP_TTL_MINUTES || 10);

    await pool.execute(
      `INSERT INTO password_reset_otps (user_id, code_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [user.id, codeHash, ttl]
    );

    await sendOtpEmail(user.email, code);
    res.json({ success: true, message: "If the email exists, a code will be sent." });
  } catch (err) {
    logger.error("forgot-password-otp error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 2) Verificar OTP y emitir reset_token
router.post("/verify-otp", verifyOtpLimiter, verifyOtpValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, code } = req.body;
    const [users] = await pool.execute("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1", [email]);
    if (users.length === 0) return res.status(400).json({ success: false, message: "Invalid code or expired" });

    const user = users[0];
    const [otps] = await pool.execute(
      `SELECT * FROM password_reset_otps
       WHERE user_id = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    if (otps.length === 0) return res.status(400).json({ success: false, message: "Invalid code or expired" });

    const otp = otps[0];
    const incomingHash = crypto.createHash("sha256").update(code).digest("hex");
    const isMatch = incomingHash === otp.code_hash;
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid code or expired" });

    await pool.execute("UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?", [otp.id]);

    const resetToken = jwt.sign(
      { purpose: "pwd_reset", userId: user.id },
      process.env.RESET_JWT_SECRET,
      { expiresIn: process.env.RESET_JWT_EXPIRES_IN || "15m" }
    );

    res.json({ success: true, message: "OTP verified", reset_token: resetToken });
  } catch (err) {
    logger.error("verify-otp error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 3) Cambiar contraseña usando reset_token
router.post("/reset-password-otp", resetWithOtpLimiter, resetWithOtpValidation, authenticateResetToken, async (req, res) => {
  try {
    const { new_password } = req.body;
    const hashedPassword = await bcrypt.hash(new_password, 12);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.resetUserId]);

    logger.info(`Password reset via OTP for user_id: ${req.resetUserId}`);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    logger.error("reset-password-otp error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* ===========================
 * DEV helper para resetear RL
 * =========================== */
router.post("/__dev/reset-login-limit", (req, res) => {
  if (process.env.NODE_ENV !== "development") return res.sendStatus(403);
  const email = (req.body?.email || "").toLowerCase().trim();
  const key = `${req.ip}:${email}`;
  loginStore.resetKey(key);
  return res.json({ success: true, key });
});

module.exports = router;
