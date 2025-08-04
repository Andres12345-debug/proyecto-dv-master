const jwt = require("jsonwebtoken")
const { pool } = require("../config/database") // <-- Cambia aquí

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar que el usuario aún existe
    const [users] = await pool.execute("SELECT id, name, email, role FROM users WHERE id = ? AND deleted_at IS NULL", [
      decoded.userId,
    ])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }
  next()
}

const requireOwnershipOrAdmin = (req, res, next) => {
  const isOwner = parseInt(req.params.id) === req.user.id
  const isAdmin = req.user.role === "admin"

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para acceder a este recurso",
    })
  }

  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
}
