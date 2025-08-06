const express = require("express")
const { body, validationResult } = require("express-validator")

const { pool } = require("../config/database")
const logger = require("../utils/logger")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Función utilitaria para ejecutar queries
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// Obtener todas las preguntas
router.get("/questions", authenticateToken, async (req, res) => {
  try {
    const questions = await executeQuery(`
      SELECT
        q.id,
        q.text,
        q.question_order,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', qo.id,
            'text', qo.text,
            'aptitude_id', qo.aptitude_id,
            'weight', qo.weight
          )
        ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      GROUP BY q.id, q.text, q.question_order
      ORDER BY q.question_order
    `)

    res.json(questions)
  } catch (error) {
    logger.error("Error fetching questions:", error)
    res.status(500).json({ error: "Failed to fetch questions" })
  }
})

// Enviar respuestas y obtener resultados
router.post(
  "/",
  authenticateToken,
  [
    body("answers").isArray().withMessage("Answers must be an array"),
    body("answers.*.question_id").isInt().withMessage("Question ID must be an integer"),
    body("answers.*.option_id").isInt().withMessage("Option ID must be an integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { answers } = req.body
      const userId = req.user.id

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Crear registro del test
        const [testResult] = await connection.execute(
          "INSERT INTO test_results (user_id, completed_at) VALUES (?, NOW())",
          [userId],
        )
        const testId = testResult.insertId

        // Guardar respuestas
        for (const answer of answers) {
          await connection.execute(
            "INSERT INTO test_answers (test_result_id, question_id, option_id) VALUES (?, ?, ?)",
            [testId, answer.question_id, answer.option_id],
          )
        }

        // Calcular puntajes y porcentaje real
        const [aptitudeScores] = await connection.execute(`
          SELECT
            a.id,
            a.name,
            a.description,
            COALESCE(SUM(CASE WHEN ta.test_result_id = ? THEN qo.weight ELSE 0 END), 0) as total_score,
            COALESCE(SUM(
              (SELECT MAX(weight) FROM question_options WHERE question_id = q.id)
            ), 0) as max_possible
          FROM aptitudes a
          LEFT JOIN question_options qo ON a.id = qo.aptitude_id
          LEFT JOIN questions q ON q.id = qo.question_id
          LEFT JOIN test_answers ta ON qo.id = ta.option_id
          GROUP BY a.id, a.name, a.description
          ORDER BY total_score DESC
        `, [testId])

        // Guardar en test_aptitude_scores
        for (const a of aptitudeScores) {
          if (a.total_score > 0) {
            const percentage = a.max_possible > 0
              ? Math.round((a.total_score / a.max_possible) * 100)
              : 0
            await connection.execute(
              `INSERT INTO test_aptitude_scores (test_result_id, aptitude_id, score, percentage)
               VALUES (?, ?, ?, ?)`,
              [testId, a.id, a.total_score, percentage]
            )
          }
        }

        // Recomendaciones de carreras y universidades
        const topAptitudes = aptitudeScores
          .filter((a) => a.total_score > 0)
          .slice(0, 3)
          .map((a) => a.id)

        let careerRecommendations = []
        let universityRecommendations = []

        if (topAptitudes.length > 0) {
          const placeholders = topAptitudes.map(() => "?").join(",")
          // Carreras compatibles
          const [careerRecs] = await connection.execute(
            `
            SELECT DISTINCT
              c.id,
              c.name,
              c.description,
              c.duration_years,
              COUNT(ca.aptitude_id) as matching_aptitudes,
              ROUND((COUNT(ca.aptitude_id) / ?) * 100, 2) as match_percentage
            FROM careers c
            JOIN career_aptitudes ca ON c.id = ca.career_id
            WHERE ca.aptitude_id IN (${placeholders})
            GROUP BY c.id
            HAVING matching_aptitudes > 0
            ORDER BY match_percentage DESC
            LIMIT 10
            `,
            [topAptitudes.length, ...topAptitudes],
          )
          careerRecommendations = careerRecs

          // Universidades compatibles (como antes)
          const [universityRecs] = await connection.execute(
            `
            SELECT DISTINCT
              u.id,
              u.name,
              u.country,
              u.location,
              u.type,
              u.modality,
              u.rating,
              COUNT(ua.aptitude_id) as matching_aptitudes,
              ROUND((COUNT(ua.aptitude_id) / ?) * 100, 2) as match_percentage
            FROM universities u
            JOIN university_aptitudes ua ON u.id = ua.university_id
            WHERE ua.aptitude_id IN (${placeholders})
            GROUP BY u.id
            HAVING matching_aptitudes > 0
            ORDER BY match_percentage DESC, u.rating DESC
            LIMIT 10
            `,
            [topAptitudes.length, ...topAptitudes],
          )
          universityRecommendations = universityRecs
        }

        await connection.commit()

        res.json({
          id: Number(testId),
          testId: Number(testId),
          aptitudes: aptitudeScores.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            score: Number(a.total_score),
            percentage: a.max_possible > 0
              ? Math.round((a.total_score / a.max_possible) * 100)
              : 0
          })),
          careers: careerRecommendations,
          universities: universityRecommendations,
        })
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (error) {
      logger.error("Error submitting test:", error)
      res.status(500).json({ error: "Failed to submit test" })
    }
  },
)

// Obtener resultados por ID
router.get("/:testId", async (req, res) => {
  try {
    const { testId } = req.params
    const connection = await pool.getConnection()
    try {
      const tests = await executeQuery("SELECT id FROM test_results WHERE id = ?", [testId])
      if (tests.length === 0) {
        return res.status(404).json({ error: "Test not found" })
      }

      const [aptitudeScores] = await connection.execute(`
        SELECT
          a.id,
          a.name,
          a.description,
          COALESCE(SUM(CASE WHEN ta.test_result_id = ? THEN qo.weight ELSE 0 END), 0) as total_score,
          COALESCE(SUM(
            (SELECT MAX(weight) FROM question_options WHERE question_id = q.id)
          ), 0) as max_possible
        FROM aptitudes a
        LEFT JOIN question_options qo ON a.id = qo.aptitude_id
        LEFT JOIN questions q ON q.id = qo.question_id
        LEFT JOIN test_answers ta ON qo.id = ta.option_id
        GROUP BY a.id, a.name, a.description
        ORDER BY total_score DESC
      `, [testId])

      const topAptitudes = aptitudeScores
        .filter((a) => a.total_score > 0)
        .slice(0, 3)
        .map((a) => a.id)

      let recommendations = []
      if (topAptitudes.length > 0) {
        const placeholders = topAptitudes.map(() => "?").join(",")
        const universityRecs = await executeQuery(
          `
          SELECT DISTINCT
            u.id,
            u.name,
            u.country,
            u.location,
            u.type,
            u.modality,
            u.rating,
            COUNT(ua.aptitude_id) as matching_aptitudes,
            ROUND((COUNT(ua.aptitude_id) / ?) * 100, 2) as match_percentage
          FROM universities u
          JOIN university_aptitudes ua ON u.id = ua.university_id
          WHERE ua.aptitude_id IN (${placeholders})
          GROUP BY u.id
          HAVING matching_aptitudes > 0
          ORDER BY match_percentage DESC, u.rating DESC
          LIMIT 10
          `,
          [topAptitudes.length, ...topAptitudes],
        )
        recommendations = universityRecs
      }

      res.json({
        id: Number(testId),
        testId: Number(testId),
        aptitudes: aptitudeScores.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          score: Number(a.total_score),
          percentage: a.max_possible > 0
            ? Math.round((a.total_score / a.max_possible) * 100)
            : 0
        })),
        recommendations,
      })
    } catch (error) {
      connection.release()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    logger.error("Error fetching test results:", error)
    res.status(500).json({ error: "Failed to fetch test results" })
  }
})

module.exports = router


