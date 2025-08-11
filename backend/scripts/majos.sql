use vocational_discovery;

-- Tabla de carreras
CREATE TABLE majors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);-- Relación entre carreras y aptitudes

CREATE TABLE major_aptitudes (
  major_id INT,
  aptitude_id INT,
  FOREIGN KEY (major_id) REFERENCES majors(id),
  FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id)
);

INSERT INTO majors (name, description)
VALUES 
  ('Ingeniería de Software', 'Programación, resolución de problemas, sistemas informáticos'),
  ('Psicología', 'Estudio de la mente y comportamiento humano'),
  ('Medicina', 'Diagnóstico y tratamiento de enfermedades');
  
  INSERT INTO major_aptitudes (major_id, aptitude_id)
VALUES 
  (1, 2), -- Ingeniería de Software ↔ Tecnología
  (2, 3), -- Psicología ↔ Servicio Social
  (3, 5); -- Medicina ↔ Ciencias
  
  INSERT INTO career_aptitudes (career_id, aptitude_id) VALUES
(1, 1),
(1, 2),
(2, 2),
(2, 3),
(3, 1),
(3, 3);


SELECT * FROM careers WHERE id = 1;
CREATE TABLE careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_years INT
);

INSERT INTO careers (name, description, duration_years) VALUES
  ('Ingeniería de Software', 'Programación, resolución de problemas, sistemas informáticos', 5),
  ('Psicología', 'Estudio de la mente y comportamiento humano', 5),
  ('Medicina', 'Diagnóstico y tratamiento de enfermedades', 6);
  
  CREATE TABLE IF NOT EXISTS career_aptitudes (
  career_id INT,
  aptitude_id INT,
  PRIMARY KEY (career_id, aptitude_id),
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
  FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE CASCADE
);

INSERT INTO career_aptitudes (career_id, aptitude_id) VALUES
  (1, 3), -- Ingeniería de Software ↔ Tecnología (suponiendo aptitud 3 es Tecnología)
  (1, 7), -- Ingeniería de Software ↔ Análisis
  (2, 10), -- Psicología ↔ Servicio Social
  (2, 5), -- Psicología ↔ Comunicación
  (3, 2), -- Medicina ↔ Ciencias
  (3, 10); -- Medicina ↔ Servicio Social
  
  SELECT * FROM careers WHERE id = 1;