const { executeQuery, testConnection } = require("../config/database")

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando proceso de seeding...")

    // Verificar conexión
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error("No se pudo conectar a la base de datos")
    }

    // Verificar si ya hay datos
    const existingUsers = await executeQuery("SELECT COUNT(*) as count FROM users")
    if (existingUsers[0].count > 0) {
      console.log("⚠️  La base de datos ya contiene datos. Saltando seeding.")
      return
    }

    console.log("📊 Insertando datos de prueba...")

    // Insertar aptitudes adicionales si no existen
    const aptitudes = [
      ["Matemáticas", "Habilidad para resolver problemas matemáticos y trabajar con números"],
      ["Ciencias", "Interés y habilidad en ciencias naturales como física, química y biología"],
      ["Tecnología", "Aptitud para trabajar con tecnología, programación y sistemas"],
      ["Arte y Creatividad", "Habilidades artísticas y creativas en diversas disciplinas"],
      ["Comunicación", "Habilidad para comunicarse efectivamente de forma oral y escrita"],
      ["Liderazgo", "Capacidad para liderar equipos y tomar decisiones"],
      ["Análisis", "Habilidad para analizar información y resolver problemas complejos"],
      ["Trabajo Social", "Interés en ayudar a otros y trabajar en temas sociales"],
      ["Negocios", "Aptitud para el mundo empresarial y comercial"],
      ["Salud", "Interés en el cuidado de la salud y bienestar de las personas"],
    ]

    for (const [name, description] of aptitudes) {
      await executeQuery("INSERT IGNORE INTO aptitudes (name, description) VALUES (?, ?)", [name, description])
    }

    // Insertar universidades adicionales
    const universities = [
      [
        "Universidad Tecnológica Nacional",
        "Argentina",
        "Buenos Aires",
        "Universidad especializada en ingeniería y tecnología",
        "publica",
        "presencial",
        "https://utn.edu.ar",
        "info@utn.edu.ar",
        4.3,
      ],
      [
        "Universidad de São Paulo",
        "Brasil",
        "São Paulo",
        "Principal universidad de Brasil con excelencia académica",
        "publica",
        "presencial",
        "https://usp.br",
        "info@usp.br",
        4.6,
      ],
      [
        "Universidad Nacional Autónoma de México",
        "México",
        "Ciudad de México",
        "Universidad pública líder en América Latina",
        "publica",
        "presencial",
        "https://unam.mx",
        "info@unam.mx",
        4.5,
      ],
      [
        "Universidad de los Andes",
        "Colombia",
        "Bogotá",
        "Universidad privada de prestigio internacional",
        "privada",
        "presencial",
        "https://uniandes.edu.co",
        "info@uniandes.edu.co",
        4.4,
      ],
      [
        "Universidad Católica de Chile",
        "Chile",
        "Santiago",
        "Universidad privada con excelencia académica",
        "privada",
        "presencial",
        "https://uc.cl",
        "info@uc.cl",
        4.3,
      ],
    ]

    for (const university of universities) {
      await executeQuery(
        "INSERT IGNORE INTO universities (name, country, location, description, type, modality, website, contact_email, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        university,
      )
    }

    // Insertar más preguntas del test
    const additionalQuestions = [
      ["¿Qué tipo de libros prefieres leer?", 11],
      ["¿Cuál de estas actividades te resulta más estimulante?", 12],
      ["¿En qué tipo de proyecto te gustaría participar?", 13],
      ["¿Qué aspecto valoras más en un trabajo?", 14],
      ["¿Cómo prefieres resolver conflictos?", 15],
    ]

    for (const [text, order] of additionalQuestions) {
      const result = await executeQuery(
        "INSERT IGNORE INTO questions (text, question_order, active) VALUES (?, ?, TRUE)",
        [text, order],
      )

      if (result.insertId) {
        // Insertar opciones para cada pregunta nueva
        const questionId = result.insertId
        const options = [
          ["Libros técnicos y científicos", 2, 3.0],
          ["Novelas y literatura", 4, 3.0],
          ["Libros de negocios", 9, 3.0],
          ["Biografías de líderes", 6, 3.0],
        ]

        for (const [optionText, aptitudeId, weight] of options) {
          await executeQuery(
            "INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES (?, ?, ?, ?)",
            [questionId, optionText, aptitudeId, weight],
          )
        }
      }
    }

    console.log("✅ Datos de prueba insertados correctamente")
    console.log("👤 Usuario admin: admin@vocationalapp.com / admin123")
    console.log("👤 Usuario test: juan@test.com / test123")
  } catch (error) {
    console.error("❌ Error durante el seeding:", error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding completado exitosamente!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Error en seeding:", error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
