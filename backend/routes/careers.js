const express = require("express")
const { query, param } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// Listar carreras con paginación y búsqueda opcional
router.get(
  "/",
  [
    authenticateToken,
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      let whereClause = "1=1"
      const queryParams = []

      if (req.query.search) {
        whereClause += " AND c.name LIKE ?"
        queryParams.push(`%${req.query.search}%`)
      }

      const careers = await executeQuery(
        `
        SELECT
          c.id,
          c.name,
          c.description,
          c.duration_years
        FROM careers c
        WHERE ${whereClause}
        ORDER BY c.name ASC
        LIMIT ? OFFSET ?
        `,
        [...queryParams, limit, offset]
      )

      const totalResult = await executeQuery(
        `
        SELECT COUNT(*) as total
        FROM careers c
        WHERE ${whereClause}
        `,
        queryParams
      )

      res.json({
        data: careers,
        total: totalResult[0]?.total || 0,
        page,
        limit,
      })
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las carreras" })
    }
  }
)

// Obtener detalle de una carrera por ID con aptitudes relacionadas
router.get(
  "/:id",
  [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")],
  async (req, res) => {
    try {
      const { id } = req.params
      const careers = await executeQuery(
        `
        SELECT
          c.id,
          c.name,
          c.description,
          c.duration_years
        FROM careers c
        WHERE c.id = ?
        `,
        [id]
      )

      if (careers.length === 0) {
        return res.status(404).json({ error: "Carrera no encontrada" })
      }

      // Obtener aptitudes relacionadas
      const aptitudes = await executeQuery(
        `
        SELECT a.id, a.name, a.description
        FROM aptitudes a
        JOIN career_aptitudes ca ON ca.aptitude_id = a.id
        WHERE ca.career_id = ?
        `,
        [id]
      )

      careers[0].aptitudes = aptitudes

      res.json(careers[0])
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la carrera" })
    }
  }
)

module.exports = router
