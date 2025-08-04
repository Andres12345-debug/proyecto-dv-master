const express = require("express")
const { body, param, validationResult } = require("express-validator")
const { pool } = require("../config/database") // Cambia aquí
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Utilidad para ejecutar queries con pool
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// GET /api/questions - Obtener todas las preguntas (admin)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questions = await executeQuery(`
      SELECT
        q.id,
        q.text,
        q.question_order,
        q.active,
        q.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', qo.id,
            'text', qo.text,
            'aptitude_id', qo.aptitude_id,
            'aptitude_name', a.name,
            'weight', qo.weight
          )
        ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      LEFT JOIN aptitudes a ON qo.aptitude_id = a.id
      GROUP BY q.id, q.text, q.question_order, q.active, q.created_at
      ORDER BY q.question_order ASC
    `)

    const formattedQuestions = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options || "[]").filter((o) => o.id !== null),
    }))

    res.json(formattedQuestions)
  } catch (error) {
    console.error("Error obteniendo preguntas:", error)
    res.status(500).json({
      error: "Error obteniendo preguntas",
    })
  }
})

// POST /api/questions - Crear nueva pregunta
router.post(
  "/",
  [
    authenticateToken,
    requireAdmin,
    body("text").trim().isLength({ min: 10, max: 500 }).withMessage("El texto debe tener entre 10 y 500 caracteres"),
    body("question_order").isInt({ min: 1 }).withMessage("El orden debe ser un número positivo"),
    body("options").isArray({ min: 2, max: 6 }).withMessage("Debe tener entre 2 y 6 opciones"),
    body("options.*.text")
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Cada opción debe tener entre 5 y 200 caracteres"),
    body("options.*.aptitude_id").isInt().withMessage("ID de aptitud inválido"),
    body("options.*.weight").isFloat({ min: 0.1, max: 5.0 }).withMessage("El peso debe estar entre 0.1 y 5.0"),
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

      const { text, question_order, options } = req.body

      // Verificar que las aptitudes existen
      const aptitudeIds = [...new Set(options.map((o) => o.aptitude_id))]
      const existingAptitudes = await executeQuery(
        `SELECT id FROM aptitudes WHERE id IN (${aptitudeIds.map(() => "?").join(",")})`,
        aptitudeIds,
      )

      if (existingAptitudes.length !== aptitudeIds.length) {
        return res.status(400).json({
          error: "Una o más aptitudes no existen",
        })
      }

      // Verificar que el orden no esté duplicado
      const existingOrder = await executeQuery("SELECT id FROM questions WHERE question_order = ?", [question_order])

      if (existingOrder.length > 0) {
        return res.status(409).json({
          error: "Ya existe una pregunta con ese orden",
        })
      }

      // Crear pregunta y opciones en transacción
      const queries = [
        {
          query: "INSERT INTO questions (text, question_order, active, created_at) VALUES (?, ?, TRUE, NOW())",
          params: [text, question_order],
        },
      ]

      const results = await executeTransaction(queries)
      const questionId = results[0].insertId

      // Crear opciones
      const optionQueries = options.map((option) => ({
        query: "INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES (?, ?, ?, ?)",
        params: [questionId, option.text, option.aptitude_id, option.weight],
      }))

      await executeTransaction(optionQueries)

      res.status(201).json({
        message: "Pregunta creada exitosamente",
        questionId,
      })
    } catch (error) {
      console.error("Error creando pregunta:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// PUT /api/questions/:id - Actualizar pregunta
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    param("id").isInt().withMessage("ID debe ser un número"),
    body("text").optional().trim().isLength({ min: 10, max: 500 }),
    body("question_order").optional().isInt({ min: 1 }),
    body("active").optional().isBoolean(),
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

      const questionId = req.params.id
      const { text, question_order, active } = req.body

      // Verificar que la pregunta existe
      const existingQuestion = await executeQuery("SELECT id FROM questions WHERE id = ?", [questionId])

      if (existingQuestion.length === 0) {
        return res.status(404).json({
          error: "Pregunta no encontrada",
        })
      }

      // Construir query dinámicamente
      const updateFields = []
      const updateValues = []

      if (text !== undefined) {
        updateFields.push("text = ?")
        updateValues.push(text)
      }
      if (question_order !== undefined) {
        // Verificar que el nuevo orden no esté duplicado
        const existingOrder = await executeQuery("SELECT id FROM questions WHERE question_order = ? AND id != ?", [
          question_order,
          questionId,
        ])

        if (existingOrder.length > 0) {
          return res.status(409).json({
            error: "Ya existe una pregunta con ese orden",
          })
        }

        updateFields.push("question_order = ?")
        updateValues.push(question_order)
      }
      if (active !== undefined) {
        updateFields.push("active = ?")
        updateValues.push(active)
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: "No hay campos para actualizar",
        })
      }

      updateFields.push("updated_at = NOW()")
      updateValues.push(questionId)

      const updateQuery = `UPDATE questions SET ${updateFields.join(", ")} WHERE id = ?`

      await executeQuery(updateQuery, updateValues)

      res.json({
        message: "Pregunta actualizada exitosamente",
      })
    } catch (error) {
      console.error("Error actualizando pregunta:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// DELETE /api/questions/:id - Eliminar pregunta
router.delete(
  "/:id",
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

      const questionId = req.params.id

      // Verificar que la pregunta existe
      const existingQuestion = await executeQuery("SELECT id FROM questions WHERE id = ?", [questionId])

      if (existingQuestion.length === 0) {
        return res.status(404).json({
          error: "Pregunta no encontrada",
        })
      }

      // Verificar que no hay respuestas asociadas
      const existingAnswers = await executeQuery("SELECT id FROM test_answers WHERE question_id = ? LIMIT 1", [
        questionId,
      ])

      if (existingAnswers.length > 0) {
        return res.status(409).json({
          error: "No se puede eliminar la pregunta porque tiene respuestas asociadas",
        })
      }

      // Eliminar pregunta (esto eliminará las opciones por CASCADE)
      await executeQuery("DELETE FROM questions WHERE id = ?", [questionId])

      res.json({
        message: "Pregunta eliminada exitosamente",
      })
    } catch (error) {
      console.error("Error eliminando pregunta:", error)
      res.status(500).json({
        error: "Error interno del servidor",
      })
    }
  },
)

// GET /api/questions/aptitudes - Obtener aptitudes disponibles
router.get("/aptitudes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const aptitudes = await executeQuery(`
      SELECT id, name, description
      FROM aptitudes
      ORDER BY name ASC
    `)

    res.json(aptitudes)
  } catch (error) {
    console.error("Error obteniendo aptitudes:", error)
    res.status(500).json({
      error: "Error obteniendo aptitudes",
    })
  }
})

module.exports = router
