const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")

const { pool } = require("../config/database")
const logger = require("../utils/logger")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
})

// Validation rules
const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("age").optional().isInt({ min: 13, max: 100 }).withMessage("Age must be between 13 and 100"),
  body("education_level").optional().isIn(["secundaria", "bachillerato", "tecnico", "universitario", "posgrado"]),
  body("location").optional().trim().isLength({ max: 100 }),
  body("interests").optional().trim().isLength({ max: 500 }),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Register
router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("age").optional().isInt({ min: 13, max: 100 }).withMessage("Age must be between 13 and 100"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        })
      }

      const { name, email, password, age, location, education_level, interests } = req.body

      // Check if user already exists
      const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        })
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Insert user
      const [result] = await pool.execute(
        `INSERT INTO users (name, email, password, age, location, education_level, interests, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', NOW())`,
        [name, email, hashedPassword, age || null, location || null, education_level || null, interests || null],
      )

      logger.info(`New user registered: ${email}`)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: result.insertId,
          name,
          email,
          role: "user",
        },
      })
    } catch (error) {
      logger.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// Login
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user
      const [users] = await pool.execute("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email])

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      const user = users[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Update last login
      await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      })

      logger.info(`User logged in: ${email}`)

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
      })
    } catch (error) {
      logger.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// Verify token endpoint
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, role, age, education_level, location, interests, created_at FROM users WHERE id = ?",
      [req.user.id],
    )

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user: users[0] })
  } catch (error) {
    logger.error("Token verification error:", error)
    res.status(500).json({ error: "Token verification failed" })
  }
})

// Refresh token endpoint
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign(
      {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    )

    res.json({ token })
  } catch (error) {
    logger.error("Token refresh error:", error)
    res.status(500).json({ error: "Token refresh failed" })
  }
})

// Logout endpoint (optional - mainly for logging)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`)
    res.json({ message: "Logged out successfully" })
  } catch (error) {
    logger.error("Logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
})

module.exports = router
