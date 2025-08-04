const express = require("express")
const { body, param, validationResult } = require("express-validator")
const { pool } = require("../config/database") // Cambia aquí
const { authenticateToken, requireOwnershipOrAdmin } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries con pool
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// GET /api/users/:id - Obtener perfil de usuario
router.get(
  "/:id",
  [authenticateToken, requireOwnershipOrAdmin, param("id").isInt().withMessage("ID debe ser un número")],
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

      const users = await executeQuery(
        `
      SELECT
        id, name, email, age, interests, education_level,
        location, role, created_at, updated_at, last_login
      FROM users
      WHERE id = ? AND deleted_at IS NULL
    `,
        [userId],
      )

      if (users.length === 0) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        })
      }

      res.json({
        user: users[0],
      })
    } catch (error) {
      console.error("Error obteniendo usuario:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// PUT /api/users/:id - Actualizar perfil de usuario
router.put(
  "/:id",
  [
    authenticateToken,
    requireOwnershipOrAdmin,
    param("id").isInt().withMessage("ID debe ser un número"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
    body("age").optional().isInt({ min: 15, max: 100 }).withMessage("La edad debe estar entre 15 y 100 años"),
    body("location").optional().trim().isLength({ max: 100 }),
    body("education_level").optional().trim().isLength({ max: 50 }),
    body("interests").optional().trim().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: errors.array(),
        })
      }

      const userId = req.params.id
      const { name, age, location, education_level, interests } = req.body

      // Verificar que el usuario existe
      const existingUser = await executeQuery("SELECT id FROM users WHERE id = ? AND deleted_at IS NULL", [userId])

      if (existingUser.length === 0) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        })
      }

      // Construir query dinámicamente
      const updateFields = []
      const updateValues = []

      if (name !== undefined) {
        updateFields.push("name = ?")
        updateValues.push(name)
      }
      if (age !== undefined) {
        updateFields.push("age = ?")
        updateValues.push(age)
      }
      if (location !== undefined) {
        updateFields.push("location = ?")
        updateValues.push(location)
      }
      if (education_level !== undefined) {
        updateFields.push("education_level = ?")
        updateValues.push(education_level)
      }
      if (interests !== undefined) {
        updateFields.push("interests = ?")
        updateValues.push(interests)
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: "No hay campos para actualizar",
        })
      }

      updateFields.push("updated_at = NOW()")
      updateValues.push(userId)

      const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`

      await executeQuery(updateQuery, updateValues)

      // Obtener el usuario actualizado
      const [updatedUser] = await executeQuery(
        `SELECT id, name, email, age, interests, education_level, location, role, created_at, updated_at, last_login
   FROM users WHERE id = ? AND deleted_at IS NULL`,
        [userId]
      )

      res.json({
        message: "Perfil actualizado exitosamente",
        user: updatedUser || null
      })
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// GET /api/users/:id/history - Obtener historial de tests del usuario
router.get(
  "/:id/history",
  [authenticateToken, requireOwnershipOrAdmin, param("id").isInt().withMessage("ID debe ser un número")],
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

      // Obtener tests del usuario
      const tests = await executeQuery(
        `
      SELECT
        tr.id,
        tr.completed_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'name', a.name,
            'description', a.description,
            'score', tas.score
          )
        ) as aptitudes
      FROM test_results tr
      LEFT JOIN test_aptitude_scores tas ON tr.id = tas.test_result_id
      LEFT JOIN aptitudes a ON tas.aptitude_id = a.id
      WHERE tr.user_id = ?
      GROUP BY tr.id, tr.completed_at
      ORDER BY tr.completed_at DESC
    `,
        [userId],
      )

      // Procesar resultados y obtener recomendaciones
      const testHistory = []

      for (const test of tests) {
        const aptitudes = JSON.parse(test.aptitudes || "[]").filter(a => a.id !== null)

        // Simula recomendaciones (puedes mejorar esto)
        const recommendations = await executeQuery(`
          SELECT name, 85 as match_percentage FROM universities LIMIT 3
        `)

        testHistory.push({
          id: test.id,
          completed_at: test.completed_at,
          aptitudes: aptitudes.sort((a, b) => b.score - a.score),
          recommendations
        })
      }

      res.json(testHistory)
    } catch (error) {
      console.error("Error obteniendo historial:", error)
      res.status(500).json({
        error: "Error obteniendo historial de tests",
      })
    }
  },
)

// GET /api/users/:id/tests - Obtener resultados de tests del usuario
router.get(
  "/:id/tests",
  [authenticateToken, requireOwnershipOrAdmin, param("id").isInt().withMessage("ID debe ser un número")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "ID inválido",
          details: errors.array(),
        })
      }

      const userId = req.params.id // <-- AGREGA ESTO

      // Obtener tests del usuario con aptitudes (con nombre)
      const tests = await executeQuery(
        `
        SELECT
          tr.id,
          tr.completed_at,
          JSON_ARRAYAGG(
            IF(a.id IS NOT NULL,
              JSON_OBJECT(
                'id', a.id,
                'name', a.name,
                'description', a.description,
                'score', tas.score,
                'percentage', tas.percentage
              ),
              NULL
            )
          ) as aptitudes
        FROM test_results tr
        LEFT JOIN test_aptitude_scores tas ON tr.id = tas.test_result_id
        LEFT JOIN aptitudes a ON tas.aptitude_id = a.id
        WHERE tr.user_id = ?
        GROUP BY tr.id, tr.completed_at
        ORDER BY tr.completed_at DESC
        `,
        [userId],
      )

      // Obtener recomendaciones solo una vez
      const recommendations = await executeQuery(`
        SELECT name, 85 as match_percentage FROM universities LIMIT 3
      `)

      const testHistory = []
      for (const test of tests) {
        let aptitudes = []
        try {
          let raw = test.aptitudes
          // console.log("APTITUDES RAW:", raw)
          if (typeof raw === "string") {
            raw = JSON.parse(raw)
          }
          if (!Array.isArray(raw)) raw = []
          aptitudes = raw.filter(a => a && a.id !== null)
          // console.log("APTITUDES FILTRADAS:", aptitudes)
        } catch (e) {
          aptitudes = []
        }
        testHistory.push({
          id: test.id,
          completed_at: test.completed_at,
          aptitudes: aptitudes.sort((a, b) => b.score - a.score),
          recommendations
        })
      }

      res.json(testHistory)
    } catch (error) {
      console.error("Error obteniendo tests del usuario:", error)
      res.status(500).json({
        error: "Error obteniendo tests del usuario",
      })
    }
  },
)

// DELETE /api/users/:id - Eliminar usuario (soft delete)
router.delete(
  "/:id",
  [authenticateToken, requireOwnershipOrAdmin, param("id").isInt().withMessage("ID debe ser un número")],
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

      // Verificar que el usuario existe
      const existingUser = await executeQuery("SELECT id FROM users WHERE id = ? AND deleted_at IS NULL", [userId])

      if (existingUser.length === 0) {
        return res.status(404).json({
          error: "Usuario no encontrado",
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

module.exports = router
