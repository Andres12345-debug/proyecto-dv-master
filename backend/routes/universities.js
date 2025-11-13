const express = require("express")
const { query, param, body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// =========================================================
// UTILIDAD PARA EJECUTAR QUERIES
// =========================================================
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// =========================================================
// LISTADO CON FILTROS Y PAGINACIÓN
// =========================================================
router.get(
  "/",
  [
    authenticateToken,
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim().isLength({ max: 100 }),
    query("country").optional().trim().isLength({ max: 50 }),
    query("location").optional().trim().isLength({ max: 100 }), // ✅ añadido
    query("type").optional().isIn(["publica", "privada"]),
    query("modality").optional().isIn(["presencial", "virtual", "hibrida"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Parámetros inválidos", details: errors.array() })
      }

      const { page = 1, limit = 10, search = "", country = "", location = "", type = "", modality = "" } = req.query
      const limitNum = Number(limit)
      const pageNum = Number(page)
      const offsetNum = (pageNum - 1) * limitNum

      const whereConditions = ["1=1"]
      const queryParams = []

      if (search) {
        whereConditions.push("(u.name LIKE ? OR u.description LIKE ?)")
        queryParams.push(`%${search}%`, `%${search}%`)
      }
      if (country) {
        whereConditions.push("u.country = ?")
        queryParams.push(country)
      }
      if (location) {
        whereConditions.push("u.location = ?")
        queryParams.push(location)
      }
      if (type) {
        whereConditions.push("u.type = ?")
        queryParams.push(type)
      }
      if (modality) {
        whereConditions.push("u.modality = ?")
        queryParams.push(modality)
      }

      const whereClause = whereConditions.join(" AND ")
      const queryParamsFinal = [...queryParams, limitNum, offsetNum]

      // 🔹 Logs para depuración
      console.log("🧠 DEBUG /universities - WHERE:", whereClause)
      console.log("🧠 PARAMS:", queryParamsFinal)

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
        LIMIT ${limitNum} OFFSET ${offsetNum}
        `,
        queryParams
      )

      const totalResult = await executeQuery(
        `SELECT COUNT(*) AS total FROM universities u WHERE ${whereClause}`,
        queryParams
      )

      const total = totalResult[0]?.total || 0
      const pages = Math.ceil(total / limitNum)

      res.json({
        universities,
        pagination: { page: pageNum, limit: limitNum, total, pages },
      })
    } catch (error) {
      console.error("❌ Error obteniendo universidades:", error)
      res.status(500).json({ error: "Error obteniendo universidades" })
    }
  }
)

// =========================================================
// LISTA DE LOCATIONS
// =========================================================
router.get("/locations", authenticateToken, async (req, res) => {
  try {
    const rows = await executeQuery(
      `SELECT DISTINCT location FROM universities WHERE location IS NOT NULL ORDER BY location ASC`
    )
    res.json(rows.map(r => r.location))
  } catch (error) {
    console.error("❌ Error obteniendo locations:", error.message)
    res.status(500).json({ error: "Error obteniendo locations" })
  }
})

// =========================================================
// DETALLE POR ID
// =========================================================
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
        WHERE u.id = ?
        `,
        [id]
      )

      if (rows.length === 0) {
        return res.status(404).json({ error: "Universidad no encontrada" })
      }

      res.json({ ...rows[0], careers: [], aptitudes: [] })
    } catch (error) {
      console.error("❌ Error obteniendo universidad:", error.message)
      res.status(500).json({ error: "Error obteniendo información de la universidad" })
    }
  }
)

// =========================================================
// CRUD SOLO ADMIN
// =========================================================

// CREAR
router.post(
  "/",
  [
    authenticateToken,
    requireAdmin,
    body("name").trim().isLength({ min: 2, max: 200 }),
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

      const dup = await executeQuery(
        `SELECT id FROM universities WHERE name = ? AND (country <=> ? OR country IS NULL) LIMIT 1`,
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
        `SELECT * FROM universities WHERE id = ?`,
        [result.insertId]
      )

      res.status(201).json({ success: true, message: "Universidad creada", university: created[0] })
    } catch (error) {
      console.error("❌ Error en POST /universities:", error.message)
      res.status(500).json({ success: false, message: "Error al crear la universidad" })
    }
  }
)

// EDITAR
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    param("id").isInt(),
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

      const [exists] = await conn.query(`SELECT id FROM universities WHERE id = ?`, [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Universidad no encontrada" })
      }

      if (typeof name === "string" && name.trim() !== "") {
        const [dup] = await conn.query(`SELECT id FROM universities WHERE name = ? AND id <> ?`, [name, id])
        if (dup.length > 0) {
          conn.release()
          return res.status(409).json({ success: false, message: "Ya existe una universidad con ese nombre" })
        }
      }

      const fields = []
      const vals = []
      if (name) { fields.push("name = ?"); vals.push(name) }
      if (country) { fields.push("country = ?"); vals.push(country) }
      if (location) { fields.push("location = ?"); vals.push(location) }
      if (description) { fields.push("description = ?"); vals.push(description) }
      if (type) { fields.push("type = ?"); vals.push(type) }
      if (modality) { fields.push("modality = ?"); vals.push(modality) }
      if (website) { fields.push("website = ?"); vals.push(website) }
      if (email) { fields.push("email = ?"); vals.push(email) }
      if (phone) { fields.push("phone = ?"); vals.push(phone) }
      if (rating) { fields.push("rating = ?"); vals.push(rating) }

      if (fields.length === 0) {
        conn.release()
        return res.status(400).json({ success: false, message: "No hay cambios a aplicar" })
      }

      vals.push(id)
      await conn.query(`UPDATE universities SET ${fields.join(", ")} WHERE id = ?`, vals)

      const [updated] = await conn.query(
        `SELECT * FROM universities WHERE id = ?`,
        [id]
      )

      conn.release()
      res.json({ success: true, message: "Universidad actualizada", university: updated[0] })
    } catch (error) {
      conn.release()
      console.error("❌ Error en PUT /universities/:id:", error.message)
      res.status(500).json({ success: false, message: "Error al actualizar la universidad" })
    }
  }
)

// BORRAR
router.delete(
  "/:id",
  [authenticateToken, requireAdmin, param("id").isInt()],
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const { id } = req.params
      const [exists] = await conn.query(`SELECT id FROM universities WHERE id = ?`, [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Universidad no encontrada" })
      }

      await conn.query(`DELETE FROM universities WHERE id = ?`, [id])
      conn.release()
      res.json({ success: true, message: "Universidad eliminada" })
    } catch (error) {
      conn.release()
      console.error("❌ Error en DELETE /universities/:id:", error.message)
      res.status(500).json({ success: false, message: "Error al eliminar la universidad" })
    }
  }
)

module.exports = router
