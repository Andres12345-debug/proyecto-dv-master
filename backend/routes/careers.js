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
      console.error("Error en GET /careers:", error)
      res.status(500).json({ error: "Error al obtener las carreras" })
    }
  }
)

/**
 * ✅ Obtener TODAS las carreras de la tabla (todas las columnas) sin paginación ni filtros
 *    Útil para combos, exportaciones, o vistas completas.
 */
router.get(
  "/all",
  [authenticateToken],
  async (req, res) => {
    try {
      const careers = await executeQuery(
        `
        SELECT
          c.*
        FROM careers c
        ORDER BY c.name ASC
        `
      )

      res.json(careers)
    } catch (error) {
      console.error("Error al obtener todas las carreras:", error)
      res.status(500).json({ error: "Error al obtener todas las carreras" })
    }
  }
)

/**
 * (Opcional) ✅ Obtener TODAS las carreras con sus aptitudes relacionadas
 *   - Requiere tablas: aptitudes(a.id, a.name, a.description)
 *     y career_aptitudes(career_id, aptitude_id)
 *   - Devuelve una lista de carreras; cada carrera trae un arreglo `aptitudes`.
 *   - Compatible con MySQL 8+ usando JSON_ARRAYAGG/JSON_OBJECT.
 */
router.get(
  "/all/with-aptitudes",
  [authenticateToken],
  async (req, res) => {
    try {
      const rows = await executeQuery(
        `
        SELECT
          c.id,
          c.name,
          c.description,
          c.duration_years,
          COALESCE(
            JSON_ARRAYAGG(
              CASE
                WHEN a.id IS NULL THEN NULL
                ELSE JSON_OBJECT(
                  'id', a.id,
                  'name', a.name,
                  'description', a.description
                )
              END
            ),
            JSON_ARRAY()
          ) AS aptitudes
        FROM careers c
        LEFT JOIN career_aptitudes ca ON ca.career_id = c.id
        LEFT JOIN aptitudes a ON a.id = ca.aptitude_id
        GROUP BY c.id, c.name, c.description, c.duration_years
        ORDER BY c.name ASC
        `
      )

      // Quitar posibles NULL dentro del array si alguna carrera no tiene aptitudes
      const data = rows.map(r => ({
        ...r,
        aptitudes: Array.isArray(r.aptitudes)
          ? r.aptitudes.filter(Boolean)
          : JSON.parse(r.aptitudes || "[]").filter(Boolean)
      }))

      res.json(data)
    } catch (error) {
      console.error("Error en GET /careers/all/with-aptitudes:", error)
      res.status(500).json({ error: "Error al obtener las carreras con aptitudes" })
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
      console.error("Error en GET /careers/:id", error)
      res.status(500).json({ error: "Error al obtener la carrera" })
    }
  }
)

module.exports = router
