const crypto = require("crypto")
const jwt = require("jsonwebtoken")

/**
 * Genera un hash seguro para passwords
 */
function generateHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex")
}

/**
 * Genera un token JWT personalizado
 */
function generateJWT(payload, expiresIn = "24h") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

/**
 * Verifica un token JWT
 */
function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Genera un ID único
 */
function generateUniqueId() {
  return crypto.randomBytes(16).toString("hex")
}

/**
 * Formatea fechas para MySQL
 */
function formatDateForMySQL(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ")
}

/**
 * Sanitiza strings para prevenir inyección SQL
 */
function sanitizeString(str) {
  if (typeof str !== "string") return str
  return str.replace(/['"\\]/g, "\\$&")
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Genera un slug URL-friendly
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Formatea números como porcentajes
 */
function formatPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Trunca texto a una longitud específica
 */
function truncateText(text, maxLength, suffix = "...") {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Convierte un objeto a query string
 */
function objectToQueryString(obj) {
  const params = new URLSearchParams()

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      params.append(key, obj[key])
    }
  })

  return params.toString()
}

/**
 * Valida que un valor esté en un rango
 */
function isInRange(value, min, max) {
  return value >= min && value <= max
}

/**
 * Genera un código aleatorio
 */
function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Convierte bytes a formato legible
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Remueve propiedades undefined/null de un objeto
 */
function cleanObject(obj) {
  const cleaned = {}

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  })

  return cleaned
}

/**
 * Pausa la ejecución por un tiempo determinado
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  generateHash,
  generateJWT,
  verifyJWT,
  generateUniqueId,
  formatDateForMySQL,
  sanitizeString,
  isValidEmail,
  generateSlug,
  calculateAge,
  formatPercentage,
  truncateText,
  objectToQueryString,
  isInRange,
  generateRandomCode,
  formatBytes,
  cleanObject,
  sleep,
}
