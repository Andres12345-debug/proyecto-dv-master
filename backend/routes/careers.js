const express = require("express")
const { query, param, body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// ========== LISTAR (paginado + búsqueda opcional) ==========
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
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Parámetros inválidos", details: errors.array() })
      }

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

// ========== OBTENER TODAS (sin paginar) ==========
router.get("/all", [authenticateToken], async (req, res) => {
  try {
    const careers = await executeQuery(
      `
      SELECT c.*
      FROM careers c
      ORDER BY c.name ASC
      `
    )
    res.json(careers)
  } catch (error) {
    console.error("Error al obtener todas las carreras:", error)
    res.status(500).json({ error: "Error al obtener todas las carreras" })
  }
})

// ========== OBTENER TODAS con APTITUDES (MySQL 8+) ==========
router.get("/all/with-aptitudes", [authenticateToken], async (req, res) => {
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

    const data = rows.map((r) => ({
      ...r,
      aptitudes: Array.isArray(r.aptitudes)
        ? r.aptitudes.filter(Boolean)
        : JSON.parse(r.aptitudes || "[]").filter(Boolean),
    }))

    res.json(data)
  } catch (error) {
    console.error("Error en GET /careers/all/with-aptitudes:", error)
    res.status(500).json({ error: "Error al obtener las carreras con aptitudes" })
  }
})

// ========== DETALLE por ID (con aptitudes) ==========
router.get(
  "/:id",
  [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Parámetros inválidos", details: errors.array() })
      }

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

/* =========================================================
   AQUI VIENEN LAS RUTAS SOLO PARA ADMIN: CREAR / EDITAR / BORRAR
   ========================================================= */

// ========== CREAR carrera (ADMIN) ==========
router.post(
  "/",
  [
    authenticateToken,
    requireAdmin,
    body("name").trim().isLength({ min: 2, max: 150 }).withMessage("El nombre debe tener entre 2 y 150 caracteres"),
    body("description").optional().isLength({ max: 2000 }).withMessage("Descripción muy larga"),
    body("duration_years").optional().isInt({ min: 1, max: 20 }).withMessage("La duración debe estar entre 1 y 20 años"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const { name, description = null, duration_years = null } = req.body

      // Evitar duplicados por nombre
      const existing = await executeQuery("SELECT id FROM careers WHERE name = ?", [name])
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: "Ya existe una carrera con ese nombre" })
      }

      const result = await executeQuery(
        `
        INSERT INTO careers (name, description, duration_years)
        VALUES (?, ?, ?)
        `,
        [name, description, duration_years]
      )

      const created = await executeQuery(
        `SELECT id, name, description, duration_years FROM careers WHERE id = ?`,
        [result.insertId]
      )

      res.status(201).json({ success: true, message: "Carrera creada", career: created[0] })
    } catch (error) {
      console.error("Error en POST /careers:", error)
      res.status(500).json({ success: false, message: "Error al crear la carrera" })
    }
  }
)

// ========== EDITAR carrera (ADMIN) ==========
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    param("id").isInt().withMessage("ID inválido"),
    body("name").optional().trim().isLength({ min: 2, max: 150 }),
    body("description").optional().isLength({ max: 2000 }),
    body("duration_years").optional().isInt({ min: 1, max: 20 }),
  ],
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const id = parseInt(req.params.id, 10)
      const { name, description, duration_years } = req.body

      // existe?
      const [exists] = await conn.query("SELECT id FROM careers WHERE id = ?", [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Carrera no encontrada" })
      }

      // Si cambia nombre, validar duplicado
      if (typeof name === "string" && name.trim() !== "") {
        const [dup] = await conn.query("SELECT id FROM careers WHERE name = ? AND id <> ?", [name, id])
        if (dup.length > 0) {
          conn.release()
          return res.status(409).json({ success: false, message: "Ya existe una carrera con ese nombre" })
        }
      }

      // Build update dinámico
      const fields = []
      const vals = []
      if (typeof name !== "undefined") { fields.push("name = ?"); vals.push(name) }
      if (typeof description !== "undefined") { fields.push("description = ?"); vals.push(description) }
      if (typeof duration_years !== "undefined") { fields.push("duration_years = ?"); vals.push(duration_years) }

      if (fields.length === 0) {
        conn.release()
        return res.status(400).json({ success: false, message: "No hay cambios a aplicar" })
      }

      vals.push(id)
      await conn.query(`UPDATE careers SET ${fields.join(", ")} WHERE id = ?`, vals)

      const [updated] = await conn.query(
        "SELECT id, name, description, duration_years FROM careers WHERE id = ?",
        [id]
      )

      conn.release()
      res.json({ success: true, message: "Carrera actualizada", career: updated[0] })
    } catch (error) {
      conn.release()
      console.error("Error en PUT /careers/:id:", error)
      res.status(500).json({ success: false, message: "Error al actualizar la carrera" })
    }
  }
)

// ========== BORRAR carrera (ADMIN) ==========
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

      // Existe?
      const [exists] = await conn.query("SELECT id FROM careers WHERE id = ?", [id])
      if (exists.length === 0) {
        conn.release()
        return res.status(404).json({ success: false, message: "Carrera no encontrada" })
      }

      await conn.beginTransaction()

      // Si tienes FK sin cascade, borra relaciones primero:
      try {
        await conn.query("DELETE FROM career_aptitudes WHERE career_id = ?", [id])
      } catch (_) {
        // si no existe la tabla/relación, no pasa nada
      }

      // Hard delete (si prefieres soft delete, añade columna y ajusta)
      await conn.query("DELETE FROM careers WHERE id = ?", [id])

      await conn.commit()
      conn.release()
      res.json({ success: true, message: "Carrera eliminada" })
    } catch (error) {
      await conn.rollback()
      conn.release()
      console.error("Error en DELETE /careers/:id:", error)
      res.status(500).json({ success: false, message: "Error al eliminar la carrera" })
    }
  }
)

module.exports = router
