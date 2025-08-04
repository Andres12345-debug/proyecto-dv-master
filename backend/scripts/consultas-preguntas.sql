-- Consultas para la tabla de preguntas
SELECT * 
FROM questions 
WHERE id = 11;

-- otener opciones de preguntas por id
SELECT * 
FROM question_options 
WHERE question_id = 11;

--Optener preguntas por id y sus opciones
SELECT 
  q.id AS question_id,
  q.text AS question_text,
  qo.id AS option_id,
  qo.text AS option_text,
  qo.aptitude_id,
  qo.weight
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.id = 11;





-- Preguntas
INSERT INTO questions (text, question_order, is_active) VALUES
('¿Qué actividad te resulta más interesante?', 1, 1),
('¿En qué tipo de ambiente prefieres trabajar?', 2, 1),
('¿Qué tipo de problemas te gusta resolver?', 3, 1),
('¿Cómo prefieres aprender nuevas cosas?', 4, 1),
('¿Qué te motiva más en un trabajo?', 5, 1),
('¿Qué habilidad consideras tu fortaleza?', 6, 1),
('¿Qué tipo de proyectos te emocionan más?', 7, 1),
('¿Cómo te gusta trabajar?', 8, 1),
('¿Qué área de conocimiento te atrae más?', 9, 1),
('¿Qué tipo de impacto quieres tener?', 10, 1),
('¿Qué tipo de tareas disfrutas más en tu tiempo libre?', 11, 1),
('¿Qué valoras más en una organización?', 12, 1),
('¿Qué tipo de retos te motivan?', 13, 1),
('¿Cómo prefieres resolver conflictos?', 14, 1),
('¿Qué tipo de liderazgo te inspira?', 15, 1),
('¿Qué medio prefieres para expresarte?', 16, 1),
('¿Qué te gustaría aprender en el futuro?', 17, 1),
('¿Qué tipo de proyectos te gustaría liderar?', 18, 1),
('¿Qué área te gustaría investigar?', 19, 1),
('¿Qué tipo de impacto social te interesa?', 20, 1);
