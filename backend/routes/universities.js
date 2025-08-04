const express = require("express")
const { query, param, validationResult } = require("express-validator")
const { pool } = require("../config/database") // Asegúrate de importar pool correctamente
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries con pool (ahora con manejo de errores detallado)
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows // Siempre devuelve un array (vacío si no hay resultados)
  } catch (err) {
    console.error("Error en executeQuery:", err)
    throw err
  }
}

// GET /api/universities - Obtener universidades con filtros y paginación
router.get(
  "/",
  [
    authenticateToken,
    query("page").optional().isInt({ min: 1 }).withMessage("Página debe ser un número positivo"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Límite debe estar entre 1 y 100"),
    query("search").optional().trim().isLength({ max: 100 }),
    query("country").optional().trim().isLength({ max: 50 }),
    query("type").optional().isIn(["publica", "privada"]),
    query("modality").optional().isIn(["presencial", "virtual", "hibrida"]),
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

      const { page = 1, limit = 10, search = "", country = "", type = "", modality = "" } = req.query

      // Asegura que limitNum y offsetNum sean SIEMPRE números válidos
      const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10
      const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
      const offsetNum = (pageNum - 1) * limitNum

      // Construir query dinámicamente
      const whereConditions = []
      const queryParams = []

      if (search) {
        whereConditions.push("(u.name LIKE ? OR u.description LIKE ?)")
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (country) {
        whereConditions.push("u.country = ?")
        queryParams.push(country)
      }

      if (type) {
        whereConditions.push("u.type = ?")
        queryParams.push(type)
      }

      if (modality) {
        whereConditions.push("u.modality = ?")
        queryParams.push(modality)
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1"

      // Obtener universidades
      const universities = await executeQuery(
        `
    SELECT
      u.id,
      u.name,
      u.country,
      u.location,
      u.description,
      u.type,
      u.modality,
      u.website,
      u.email,
      u.phone,
      u.rating,
      u.created_at,
      COUNT(c.id) as career_count
    FROM universities u
    LEFT JOIN careers c ON u.id = c.university_id
    WHERE ${whereClause}
    GROUP BY u.id
    ORDER BY u.rating DESC, u.name ASC
    LIMIT ${limitNum} OFFSET ${offsetNum}
  `,
        queryParams,
      )

      console.log({ limitNum, offsetNum, queryParams })

      // Obtener total para paginación
      const totalResult = await executeQuery(
        `
      SELECT COUNT(DISTINCT u.id) as total
      FROM universities u
      WHERE ${whereClause}
    `,
        queryParams,
      )

      const total = totalResult[0]?.total || 0
      const pages = Math.ceil(total / limitNum)

      res.json({
        universities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
      })
    } catch (error) {
      console.error("Error obteniendo universidades:", error)
      res.status(500).json({
        error: "Error obteniendo universidades",
      })
    }
  },
)

// GET /api/universities/countries - Obtener lista de países
router.get("/countries", authenticateToken, async (req, res) => {
  try {
    const countries = await executeQuery(`
      SELECT DISTINCT country
      FROM universities
      WHERE country IS NOT NULL
      ORDER BY country ASC
    `)

    res.json(countries.map((c) => c.country))
  } catch (error) {
    console.error("Error obteniendo países:", error)
    res.status(500).json({
      error: "Error obteniendo países",
    })
  }
})

// GET /api/universities/:id - Obtener universidad específica
router.get("/:id", [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "ID inválido",
        details: errors.array(),
      })
    }

    const universityId = req.params.id

    // Obtener información de la universidad
    const universities = await executeQuery(
      `
      SELECT
        u.id,
        u.name,
        u.country,
        u.location,
        u.description,
        u.type,
        u.modality,
        u.website,
        u.email,
        u.phone,
        u.rating,
        u.created_at
      FROM universities u
      WHERE u.id = ?
    `,
      [universityId],
    )

    if (universities.length === 0) {
      return res.status(404).json({
        error: "Universidad no encontrada",
      })
    }

    const university = universities[0]

    // Obtener carreras de la universidad
    const careers = await executeQuery(
      `
      SELECT
        id,
        name,
        description,
        duration_years
      FROM careers
      WHERE university_id = ?
      ORDER BY name ASC
    `,
      [universityId],
    )

    // Obtener aptitudes relacionadas (ajusta si tu modelo es career_aptitudes)
    const aptitudes = await executeQuery(
      `
      SELECT
        a.name,
        a.description,
        ca.importance_level
      FROM careers c
      JOIN career_aptitudes ca ON c.id = ca.career_id
      JOIN aptitudes a ON ca.aptitude_id = a.id
      WHERE c.university_id = ?
      ORDER BY ca.importance_level DESC
    `,
      [universityId],
    )

    res.json({
      ...university,
      careers,
      aptitudes,
    })
  } catch (error) {
    console.error("Error obteniendo universidad:", error)
    res.status(500).json({
      error: "Error obteniendo información de la universidad",
    })
  }
})

module.exports = router
