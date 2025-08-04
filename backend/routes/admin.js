const express = require("express")
const { query, param, validationResult } = require("express-validator")
const { pool } = require("../config/database") // Cambia aquí
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries con pool
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// GET /api/admin/dashboard - Estadísticas del dashboard
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Obtener estadísticas generales
    const stats = await Promise.all([
      // Total de usuarios
      executeQuery("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL"),
      // Usuarios registrados hoy
      executeQuery("SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL"),
      // Total de tests realizados
      executeQuery("SELECT COUNT(*) as total FROM test_results"),
      // Tests realizados hoy
      executeQuery("SELECT COUNT(*) as total FROM test_results WHERE DATE(completed_at) = CURDATE()"),
      // Total de universidades
      executeQuery("SELECT COUNT(*) as total FROM universities WHERE deleted_at IS NULL"),
      // Total de preguntas activas
      executeQuery("SELECT COUNT(*) as total FROM questions WHERE active = TRUE"),
      // Usuarios más activos (últimos 30 días)
      executeQuery(`
        SELECT
          u.name,
          u.email,
          COUNT(tr.id) as tests_count
        FROM users u
        LEFT JOIN test_results tr ON u.id = tr.user_id
          AND tr.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.name, u.email
        ORDER BY tests_count DESC
        LIMIT 10
      `),
      // Tests por día (últimos 7 días)
      executeQuery(`
        SELECT
          DATE(completed_at) as date,
          COUNT(*) as count
        FROM test_results
        WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(completed_at)
        ORDER BY date ASC
      `),
    ])

    const dashboard = {
      totalUsers: stats[0][0].total,
      newUsersToday: stats[1][0].total,
      totalTests: stats[2][0].total,
      testsToday: stats[3][0].total,
      totalUniversities: stats[4][0].total,
      activeQuestions: stats[5][0].total,
      activeUsers: stats[6],
      testsPerDay: stats[7],
    }

    res.json(dashboard)
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    res.status(500).json({
      error: "Error obteniendo estadísticas del dashboard",
    })
  }
})

// GET /api/admin/users - Obtener todos los usuarios
router.get(
  "/users",
  [
    authenticateToken,
    requireAdmin,
    query("page").optional().isInt({ min: 1 }).withMessage("Página debe ser un número positivo"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Límite debe estar entre 1 y 100"),
    query("search").optional().trim().isLength({ max: 100 }),
    query("role").optional().isIn(["user", "admin"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Parámetros inválidos",
          details: errors.array(),
        })
      }

      const { page = 1, limit = 20, search = "", role = "" } = req.query
      const offset = (page - 1) * limit

      // Construir query dinámicamente
      const whereConditions = ["deleted_at IS NULL"]
      const queryParams = []

      if (search) {
        whereConditions.push("(name LIKE ? OR email LIKE ?)")
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (role) {
        whereConditions.push("role = ?")
        queryParams.push(role)
      }

      const whereClause = whereConditions.join(" AND ")

      // Obtener usuarios
      const users = await executeQuery(
        `
      SELECT
        u.id,
        u.name,
        u.email,
        u.age,
        u.location,
        u.education_level,
        u.role,
        u.created_at,
        u.last_login,
        COUNT(tr.id) as tests_count
      FROM users u
      LEFT JOIN test_results tr ON u.id = tr.user_id
      WHERE ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [...queryParams, Number.parseInt(limit), Number.parseInt(offset)],
      )

      // Obtener total para paginación
      const totalResult = await executeQuery(
        `
      SELECT COUNT(*) as total
      FROM users
      WHERE ${whereClause}
    `,
        queryParams,
      )

      const total = totalResult[0].total
      const pages = Math.ceil(total / limit)

      res.json({
        users,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages,
        },
      })
    } catch (error) {
      console.error("Error obteniendo usuarios:", error)
      res.status(500).json({
        error: "Error obteniendo usuarios",
      })
    }
  },
)

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete(
  "/users/:id",
  [authenticateToken, requireAdmin, param("id").isInt().withMessage("ID debe ser un número")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "ID inválido",
          details: errors.array(),
        })
      }

      const userId = req.params.id

      // Verificar que el usuario existe y no es admin
      const user = await executeQuery("SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL", [userId])

      if (user.length === 0) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        })
      }

      if (user[0].role === "admin") {
        return res.status(403).json({
          error: "No se puede eliminar un usuario administrador",
        })
      }

      // Verificar que no es el usuario actual
      if (Number.parseInt(userId) === req.user.id) {
        return res.status(403).json({
          error: "No puedes eliminar tu propia cuenta",
        })
      }

      // Soft delete
      await executeQuery("UPDATE users SET deleted_at = NOW() WHERE id = ?", [userId])

      res.json({
        message: "Usuario eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// GET /api/admin/tests - Obtener estadísticas de tests
router.get("/tests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Estadísticas de tests
    const stats = await Promise.all([
      // Tests por aptitud
      executeQuery(`
        SELECT
          a.name,
          COUNT(ta.id) as count,
          AVG(ta.score) as avg_score
        FROM aptitudes a
        LEFT JOIN test_aptitudes ta ON a.id = ta.aptitude_id
        GROUP BY a.id, a.name
        ORDER BY count DESC
      `),
      // Tests por mes (últimos 12 meses)
      executeQuery(`
        SELECT
          DATE_FORMAT(completed_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM test_results
        WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
        ORDER BY month ASC
      `),
      // Preguntas más respondidas
      executeQuery(`
        SELECT
          q.text,
          COUNT(ta.id) as responses
        FROM questions q
        LEFT JOIN test_answers ta ON q.id = ta.question_id
        WHERE q.active = TRUE
        GROUP BY q.id, q.text
        ORDER BY responses DESC
        LIMIT 10
      `),
    ])

    res.json({
      aptitudeStats: stats[0],
      testsPerMonth: stats[1],
      popularQuestions: stats[2],
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas de tests:", error)
    res.status(500).json({
      error: "Error obteniendo estadísticas de tests",
    })
  }
})

// GET /api/admin/universities/stats - Estadísticas de universidades
router.get("/universities/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Universidades por país
      executeQuery(`
        SELECT
          country,
          COUNT(*) as count
        FROM universities
        WHERE deleted_at IS NULL
        GROUP BY country
        ORDER BY count DESC
      `),
      // Universidades por tipo
      executeQuery(`
        SELECT
          type,
          COUNT(*) as count
        FROM universities
        WHERE deleted_at IS NULL
        GROUP BY type
      `),
      // Universidades por modalidad
      executeQuery(`
        SELECT
          modality,
          COUNT(*) as count
        FROM universities
        WHERE deleted_at IS NULL
        GROUP BY modality
      `),
      // Top universidades por rating
      executeQuery(`
        SELECT
          name,
          country,
          rating,
          type,
          modality
        FROM universities
        WHERE deleted_at IS NULL
        ORDER BY rating DESC
        LIMIT 10
      `),
    ])

    res.json({
      byCountry: stats[0],
      byType: stats[1],
      byModality: stats[2],
      topRated: stats[3],
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas de universidades:", error)
    res.status(500).json({
      error: "Error obteniendo estadísticas de universidades",
    })
  }
})

// GET /api/admin/logs - Obtener logs del sistema (si existe la tabla)
router.get(
  "/logs",
  [
    authenticateToken,
    requireAdmin,
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("action").optional().trim(),
  ],
  async (req, res) => {
    try {
      const { page = 1, limit = 50, action = "" } = req.query
      const offset = (page - 1) * limit

      const whereConditions = []
      const queryParams = []

      if (action) {
        whereConditions.push("action LIKE ?")
        queryParams.push(`%${action}%`)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

      const logs = await executeQuery(
        `
      SELECT
        sl.id,
        sl.user_id,
        u.name as user_name,
        sl.action,
        sl.table_name,
        sl.record_id,
        sl.ip_address,
        sl.created_at
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ${whereClause}
      ORDER BY sl.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [...queryParams, Number.parseInt(limit), Number.parseInt(offset)],
      )

      const totalResult = await executeQuery(
        `
      SELECT COUNT(*) as total
      FROM system_logs sl
      ${whereClause}
    `,
        queryParams,
      )

      const total = totalResult[0].total
      const pages = Math.ceil(total / limit)

      res.json({
        logs,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages,
        },
      })
    } catch (error) {
      // Si la tabla no existe, devolver array vacío
      if (error.code === "ER_NO_SUCH_TABLE") {
        return res.json({
          logs: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        })
      }

      console.error("Error obteniendo logs:", error)
      res.status(500).json({
        error: "Error obteniendo logs del sistema",
      })
    }
  },
)

module.exports = router
