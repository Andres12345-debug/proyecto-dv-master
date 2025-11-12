const express = require("express")
const { query, param, body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries con pool
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// ============ LISTADO con filtros y paginación ============
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
        return res.status(400).json({ error: "Parámetros inválidos", details: errors.array() })
      }

      const { page = 1, limit = 10, search = "", country = "", type = "", modality = "" } = req.query
      const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10
      const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
      const offsetNum = (pageNum - 1) * limitNum

      // Base: si tienes soft delete
      const whereConditions = ["(u.deleted_at IS NULL OR u.deleted_at IS NULL)"] // no rompe si no existe
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

      const whereClause = whereConditions.length ? whereConditions.join(" AND ") : "1=1"

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
        WHERE ${whereClause}
        ORDER BY u.rating DESC, u.name ASC
        LIMIT ? OFFSET ?
        `,
        [...queryParams, limitNum, offsetNum]
      )

      const totalResult = await executeQuery(
        `
        SELECT COUNT(*) as total
        FROM universities u
        WHERE ${whereClause}
        `,
        queryParams
      )

      const total = totalResult[0]?.total || 0
      const pages = Math.ceil(total / limitNum)

      res.json({
        universities,
        pagination: { page: pageNum, limit: limitNum, total, pages },
      })
    } catch (error) {
      console.error("Error obteniendo universidades:", error)
      res.status(500).json({ error: "Error obteniendo universidades" })
    }
  }
)

// ============ LISTA de locations (distinct) ============
router.get("/locations", authenticateToken, async (req, res) => {
  try {
    const rows = await executeQuery(
      `
      SELECT DISTINCT location
      FROM universities
      WHERE location IS NOT NULL
      ORDER BY location ASC
      `
    )
    res.json(rows.map(r => r.location))
  } catch (error) {
    console.error("Error obteniendo locations:", error)
    res.status(500).json({ error: "Error obteniendo locations" })
  }
})

// ============ DETALLE por ID ============
router.get(
  "/:id",
  [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "ID inválido", details: errors.array() })
      }

      const { id } = req.params
      const rows = await executeQuery(
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
        WHERE u.id = ? AND (u.deleted_at IS NULL OR u.deleted_at IS NULL)
        `,
        [id]
      )

      if (rows.length === 0) {
        return res.status(404).json({ error: "Universidad no encontrada" })
      }

      // Si no manejas relaciones a carreras/aptitudes ahora, devolvemos arrays vacíos:
      res.json({ ...rows[0], careers: [], aptitudes: [] })
    } catch (error) {
      console.error("Error obteniendo universidad:", error)
      res.status(500).json({ error: "Error obteniendo información de la universidad" })
    }
  }
)

/* =========================================================
   CRUD SOLO ADMIN
   ========================================================= */

// ============ CREAR (ADMIN) ============
router.post(
  "/",
  [
    authenticateToken,
    requireAdmin,
    body("name").trim().isLength({ min: 2, max: 200 }).withMessage("El nombre debe tener entre 2 y 200 caracteres"),
    body("country").optional().trim().isLength({ max: 100 }),
    body("location").optional().trim().isLength({ max: 150 }),
    body("description").optional().isLength({ max: 5000 }),
    body("type").optional().isIn(["publica", "privada"]),
    body("modality").optional().isIn(["presencial", "virtual", "hibrida"]),
    body("website").optional().isURL().withMessage("website inválido"),
    body("email").optional().isEmail().withMessage("email inválido"),
    body("phone").optional().trim().isLength({ max: 30 }),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("rating debe estar entre 0 y 5"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const {
        name,
        country = null,
        location = null,
        description = null,
        type = null,
        modality = null,
        website = null,
        email = null,
        phone = null,
        rating = null,
      } = req.body

      // Evitar duplicados simples por nombre + país
      const dup = await executeQuery(
        `SELECT id FROM universities WHERE name = ? AND (country <=> ? OR country IS NULL) AND (deleted_at IS NULL OR deleted_at IS NULL) LIMIT 1`,
        [name, country]
      )
      if (dup.length > 0) {
        return res.status(409).json({ success: false, message: "Ya existe una universidad con ese nombre/país" })
      }

      const result = await executeQuery(
        `
        INSERT INTO universities (name, country, location, description, type, modality, website, email, phone, rating, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [name, country, location, description, type, modality, website, email, phone, rating]
      )

      const created = await executeQuery(
        `SELECT id, name, country, location, description, type, modality, website, email, phone, rating, created_at
         FROM universities WHERE id = ?`,
        [result.insertId]
      )

      res.status(201).json({ success: true, message: "Universidad creada", university: created[0] })
    } catch (error) {
      console.error("Error en POST /universities:", error)
      res.status(500).json({ success: false, message: "Error al crear la universidad" })
    }
  }
)

// ============ EDITAR (ADMIN) ============
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    param("id").isInt().withMessage("ID inválido"),
    body("name").optional().trim().isLength({ min: 2, max: 200 }),
    body("country").optional().trim().isLength({ max: 100 }),
    body("location").optional().trim().isLength({ max: 150 }),
    body("description").optional().isLength({ max: 5000 }),
    body("type").optional().isIn(["publica", "privada"]),
    body("modality").optional().isIn(["presencial", "virtual", "hibrida"]),
    body("website").optional().isURL(),
    body("email").optional().isEmail(),
    body("phone").optional().trim().isLength({ max: 30 }),
    body("rating").optional().isFloat({ min: 0, max: 5 }),
  ],
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        conn.release()
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const id = parseInt(req.params.id, 10)
      const { name, country, location, description, type, modality, website, email, phone, rating } = req.body

      const [exists] = await conn.query(`SELECT id FROM universities WHERE id = ? AND (deleted_at IS NULL OR deleted_at IS NULL)`, [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Universidad no encontrada" })
      }

      if (typeof name === "string" && name.trim() !== "") {
        const [dup] = await conn.query(
          `SELECT id FROM universities WHERE name = ? AND id <> ? AND (deleted_at IS NULL OR deleted_at IS NULL)`,
          [name, id]
        )
        if (dup.length > 0) {
          conn.release()
          return res.status(409).json({ success: false, message: "Ya existe una universidad con ese nombre" })
        }
      }

      const fields = []
      const vals = []
      if (typeof name !== "undefined") { fields.push("name = ?"); vals.push(name) }
      if (typeof country !== "undefined") { fields.push("country = ?"); vals.push(country) }
      if (typeof location !== "undefined") { fields.push("location = ?"); vals.push(location) }
      if (typeof description !== "undefined") { fields.push("description = ?"); vals.push(description) }
      if (typeof type !== "undefined") { fields.push("type = ?"); vals.push(type) }
      if (typeof modality !== "undefined") { fields.push("modality = ?"); vals.push(modality) }
      if (typeof website !== "undefined") { fields.push("website = ?"); vals.push(website) }
      if (typeof email !== "undefined") { fields.push("email = ?"); vals.push(email) }
      if (typeof phone !== "undefined") { fields.push("phone = ?"); vals.push(phone) }
      if (typeof rating !== "undefined") { fields.push("rating = ?"); vals.push(rating) }

      if (fields.length === 0) {
        conn.release()
        return res.status(400).json({ success: false, message: "No hay cambios a aplicar" })
      }

      vals.push(id)
      await conn.query(`UPDATE universities SET ${fields.join(", ")} WHERE id = ?`, vals)

      const [updated] = await conn.query(
        `SELECT id, name, country, location, description, type, modality, website, email, phone, rating, created_at
         FROM universities WHERE id = ?`,
        [id]
      )

      conn.release()
      res.json({ success: true, message: "Universidad actualizada", university: updated[0] })
    } catch (error) {
      conn.release()
      console.error("Error en PUT /universities/:id:", error)
      res.status(500).json({ success: false, message: "Error al actualizar la universidad" })
    }
  }
)

// ============ BORRAR (ADMIN) ============
router.delete(
  "/:id",
  [authenticateToken, requireAdmin, param("id").isInt().withMessage("ID inválido")],
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        conn.release()
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const id = parseInt(req.params.id, 10)

      const [exists] = await conn.query(`SELECT id FROM universities WHERE id = ?`, [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Universidad no encontrada" })
      }

      await conn.beginTransaction()

      // Intento de soft delete
      try {
        await conn.query(`UPDATE universities SET deleted_at = NOW() WHERE id = ?`, [id])
      } catch (e) {
        // Si no existe deleted_at -> hard delete como fallback
        await conn.query(`DELETE FROM universities WHERE id = ?`, [id])
      }

      await conn.commit()
      conn.release()
      res.json({ success: true, message: "Universidad eliminada" })
    } catch (error) {
      await conn.rollback()
      conn.release()
      console.error("Error en DELETE /universities/:id:", error)
      res.status(500).json({ success: false, message: "Error al eliminar la universidad" })
    }
  }
)

/* =========================================================
   (OPCIONAL) MATCH-CAREERS
   Si luego redefines relaciones carrera-universidad, ajusta este endpoint.
   ========================================================= */

// Mantengo tu endpoint como estaba. Revisa que realmente recibas aptitudeIds como
// array (mejor en body que en query).
router.post(
  "/match-careers",
  [authenticateToken, query("aptitudeIds").isArray().withMessage("aptitudeIds debe ser un array")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Parámetros inválidos", details: errors.array() })
      }

      const { aptitudeIds } = req.query
      if (!Array.isArray(aptitudeIds) || aptitudeIds.length === 0) {
        return res.json([])
      }

      const careers = await executeQuery(
        `
        SELECT DISTINCT
          c.id,
          c.name,
          c.description,
          c.duration_years,
          c.university_id,
          u.name AS university_name,
          COUNT(ca.aptitude_id) as matching_aptitudes,
          ROUND((COUNT(ca.aptitude_id) / ?) * 100, 2) as match_percentage
        FROM careers c
        JOIN career_aptitudes ca ON c.id = ca.career_id
        JOIN universities u ON c.university_id = u.id
        WHERE ca.aptitude_id IN (${aptitudeIds.map(() => "?").join(",")})
        GROUP BY c.id
        HAVING matching_aptitudes > 0
        ORDER BY match_percentage DESC
        LIMIT 10
        `,
        [aptitudeIds.length, ...aptitudeIds]
      )

      res.json(careers)
    } catch (error) {
      console.error("Error obteniendo carreras coincidentes:", error)
      res.status(500).json({ error: "Error obteniendo carreras coincidentes" })
    }
  }
)

module.exports = router
