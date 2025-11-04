// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Rutas
const authRoutes = require("./routes/auth");
const testsRouter = require("./routes/tests");
const universityRoutes = require("./routes/universities");
const userRoutes = require("./routes/users");
const careersRouter = require("./routes/careers");

// Utilidades
const logger = require("./utils/logger");
const { pool } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================================
// 🔐 Seguridad y middlewares globales
// =======================================
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

// Límite general de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por IP
  message: "Demasiadas solicitudes, intenta más tarde.",
});
app.use(limiter);

// Parseo de body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging básico
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// =======================================
// 🚦 Rutas principales
// =======================================
app.use("/api/auth", authRoutes);           // Registro, login, OTP
app.use("/api/test", testsRouter);          // Tests vocacionales
app.use("/api/universities", universityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/careers", careersRouter);

// =======================================
// 🩺 Health check
// =======================================
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1"); // prueba conexión MySQL
    res.json({
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    logger.error("Database connection error:", err);
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      message: err.message,
    });
  }
});

// =======================================
// ⚠️ Error handling middleware
// =======================================
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// =======================================
// 🧭 404 handler
// =======================================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================================
// 🚀 Iniciar servidor
// =======================================
app.listen(PORT, async () => {
  // Verificación inicial de configuración crítica
  const requiredEnv = [
    "JWT_SECRET",
    "RESET_JWT_SECRET",
    "SMTP_USER",
    "SMTP_PASS",
  ];
  const missing = requiredEnv.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger.warn(`⚠️ Falta configurar en .env: ${missing.join(", ")}`);
  }

  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    logger.info(`✅ DB conectado (${rows[0].now})`);
  } catch (dbErr) {
    logger.error("❌ Error conectando a MySQL:", dbErr);
  }

  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
