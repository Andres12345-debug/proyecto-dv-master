const { body } = require("express-validator")

// Validaciones comunes reutilizables
const commonValidations = {
  email: body("email").isEmail().normalizeEmail().withMessage("Email inválido"),

  password: body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  name: body("name").trim().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  age: body("age").optional().isInt({ min: 15, max: 100 }).withMessage("La edad debe estar entre 15 y 100 años"),

  location: body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La ubicación no puede exceder 100 caracteres"),

  educationLevel: body("education_level")
    .optional()
    .trim()
    .isIn([
      "Secundario Incompleto",
      "Secundario Completo",
      "Universitario Incompleto",
      "Universitario Completo",
      "Posgrado",
    ])
    .withMessage("Nivel educativo inválido"),

  interests: body("interests")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Los intereses no pueden exceder 500 caracteres"),

  universityName: body("name")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("El nombre debe tener entre 3 y 200 caracteres"),

  country: body("country")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El país debe tener entre 2 y 100 caracteres"),

  universityType: body("type").isIn(["publica", "privada"]).withMessage("El tipo debe ser 'publica' o 'privada'"),

  modality: body("modality")
    .isIn(["presencial", "virtual", "hibrida"])
    .withMessage("La modalidad debe ser 'presencial', 'virtual' o 'hibrida'"),

  rating: body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("La calificación debe estar entre 0 y 5"),

  website: body("website").optional().isURL().withMessage("Debe ser una URL válida"),

  phone: body("contact_phone")
    .optional()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Número de teléfono inválido"),
}

// Conjuntos de validaciones para diferentes endpoints
const validationSets = {
  userRegistration: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    commonValidations.age,
    commonValidations.location,
    commonValidations.educationLevel,
    commonValidations.interests,
  ],

  userLogin: [commonValidations.email, body("password").notEmpty().withMessage("La contraseña es requerida")],

  userUpdate: [
    commonValidations.name,
    commonValidations.age,
    commonValidations.location,
    commonValidations.educationLevel,
    commonValidations.interests,
  ],

  universityCreate: [
    commonValidations.universityName,
    commonValidations.country,
    body("location").trim().isLength({ min: 2, max: 200 }),
    body("description").optional().trim().isLength({ max: 1000 }),
    commonValidations.universityType,
    commonValidations.modality,
    commonValidations.website,
    commonValidations.email.optional(),
    commonValidations.phone,
    body("admission_requirements").optional().trim().isLength({ max: 2000 }),
    commonValidations.rating,
  ],

  questionCreate: [
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
}

module.exports = {
  commonValidations,
  validationSets,
}
