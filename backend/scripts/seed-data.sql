    -- Datos semilla de la aplicación vocacional
    -- Este archivo contiene datos de muestra para pruebas y desarrollo

    USE vocational_discovery;


    -- Aptitudes
       CREATE TABLE IF NOT EXISTS career_aptitudes (
      career_id INT,
      aptitude_id INT,
      importance_level VARCHAR(10),
      PRIMARY KEY (career_id, aptitude_id),
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
      FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE CASCADE
    );
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



    -- Insertar opciones de pregunta para la Pregunta 1
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (1, 'Resolver ecuaciones matemáticas complejas', 1, 3),
    (1, 'Realizar experimentos científicos', 2, 3),
    (1, 'Programar aplicaciones o sitios web', 3, 3),
    (1, 'Crear obras de arte o diseños', 4, 3),
    (1, 'Escribir artículos o dar presentaciones', 5, 3);

    -- Insertar opciones de pregunta para la Pregunta 2
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (2, 'Laboratorio de investigación', 2, 2),
    (2, 'Oficina con tecnología avanzada', 3, 2),
    (2, 'Estudio de arte o diseño', 4, 2),
    (2, 'Sala de juntas dirigiendo reuniones', 6, 2),
    (2, 'Centro comunitario ayudando a personas', 10, 2);

    -- Insertar opciones de pregunta para la Pregunta 3
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (3, 'Problemas matemáticos y lógicos', 1, 3),
    (3, 'Problemas técnicos y de sistemas', 3, 3),
    (3, 'Problemas científicos y de investigación', 2, 3),
    (3, 'Problemas creativos y de diseño', 4, 3),
    (3, 'Problemas sociales y comunitarios', 10, 3);

    -- Insertar opciones de pregunta para la Pregunta 4
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (4, 'Leyendo libros y artículos', 5, 2),
    (4, 'Realizando experimentos prácticos', 2, 2),
    (4, 'Asistiendo a cursos y talleres', 3, 2),
    (4, 'Participando en debates y discusiones', 5, 2),
    (4, 'Observando y aprendiendo de otros', 8, 2);

    -- Insertar opciones de pregunta para la Pregunta 5
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (5, 'La resolución de problemas complejos', 1, 3),
    (5, 'La innovación y la creación de cosas nuevas', 3, 3),
    (5, 'El impacto positivo en la vida de las personas', 10, 3),
    (5, 'El reconocimiento y el éxito profesional', 9, 3),
    (5, 'La colaboración y el trabajo en equipo', 8, 3);

    -- Insertar opciones de pregunta para la Pregunta 6
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (6, 'La capacidad de análisis y resolución de problemas', 7, 3),
    (6, 'La creatividad y la capacidad de innovación', 4, 3),
    (6, 'La habilidad para comunicarme y conectar con otros', 5, 3),
    (6, 'La capacidad de liderazgo y toma de decisiones', 6, 3),
    (6, 'La empatía y la capacidad de ayudar a los demás', 10, 3);

    -- Insertar opciones de pregunta para la Pregunta 7
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (7, 'Proyectos de investigación científica', 2, 3),
    (7, 'Proyectos de desarrollo tecnológico', 3, 3),
    (7, 'Proyectos artísticos y creativos', 4, 3),
    (7, 'Proyectos de emprendimiento social', 10, 3),
    (7, 'Proyectos de consultoría empresarial', 9, 3);

    -- Insertar opciones de pregunta para la Pregunta 8
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (8, 'De forma independiente y autónoma', 7, 2),
    (8, 'En equipo y colaborando con otros', 8, 2),
    (8, 'Liderando y dirigiendo a otros', 6, 2),
    (8, 'Siguiendo instrucciones y procedimientos', 1, 2),
    (8, 'Ayudando y apoyando a otros', 10, 2);

    -- Insertar opciones de pregunta para la Pregunta 9
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (9, 'Las matemáticas y la lógica', 1, 3),
    (9, 'Las ciencias naturales y la biología', 2, 3),
    (9, 'La tecnología y la informática', 3, 3),
    (9, 'El arte, el diseño y la creatividad', 4, 3),
    (9, 'Las ciencias sociales y la comunicación', 5, 3);

    -- Insertar opciones de pregunta para la Pregunta 10
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (10, 'Resolver problemas complejos y desafiantes', 7, 3),
    (10, 'Crear soluciones innovadoras y originales', 3, 3),
    (10, 'Ayudar a mejorar la vida de las personas', 10, 3),
    (10, 'Contribuir al desarrollo de la sociedad', 10, 3),
    (10, 'Generar un impacto positivo en el mundo', 8, 3);

    -- Inserta opciones de pregunta para la pregunta 11
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (11, 'Resolver acertijos matemáticos', 1, 2),
    (11, 'Leer libros de ciencia', 2, 2),
    (11, 'Jugar con tecnología o programar', 3, 2),
    (11, 'Dibujar, pintar o crear arte', 4, 2),
    (11, 'Participar en debates o escribir', 5, 2);

    -- Insertar opciones de pregunta para la Pregunta 12
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (12, 'Innovación y creatividad', 4, 2),
    (12, 'Trabajo en equipo y colaboración', 8, 2),
    (12, 'Liderazgo y toma de decisiones', 6, 2),
    (12, 'Impacto social y ayuda a la comunidad', 10, 2),
    (12, 'Desarrollo tecnológico', 3, 2);

    -- Insertar opciones de pregunta para la Pregunta 13
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (13, 'Retos matemáticos y lógicos', 1, 2),
    (13, 'Retos científicos y de investigación', 2, 2),
    (13, 'Retos creativos y artísticos', 4, 2),
    (13, 'Retos de liderazgo y gestión', 6, 2),
    (13, 'Retos sociales y comunitarios', 10, 2);

    -- Insertar opciones de pregunta para la Pregunta 14
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (14, 'Analizando la situación y buscando soluciones', 7, 2),
    (14, 'Dialogando y comunicando ideas', 5, 2),
    (14, 'Proponiendo alternativas creativas', 4, 2),
    (14, 'Mediando y ayudando a las partes', 10, 2),
    (14, 'Tomando decisiones y liderando el proceso', 6, 2);

    -- Insertar opciones de pregunta para la Pregunta 15
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (15, 'Liderazgo democrático y participativo', 6, 2),
    (15, 'Liderazgo innovador y creativo', 4, 2),
    (15, 'Liderazgo analítico y estratégico', 7, 2),
    (15, 'Liderazgo social y comunitario', 10, 2),
    (15, 'Liderazgo comunicativo y motivador', 5, 2);

    -- Insertar opciones de pregunta para la Pregunta 16
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (16, 'Escritura', 5, 2),
    (16, 'Arte visual', 4, 2),
    (16, 'Tecnología (videos, apps, redes)', 3, 2),
    (16, 'Presentaciones orales', 5, 2),
    (16, 'Proyectos colaborativos', 8, 2);

    -- Insertar opciones de pregunta para la Pregunta 17
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (17, 'Nuevas tecnologías y programación', 3, 2),
    (17, 'Ciencias y experimentos', 2, 2),
    (17, 'Arte y diseño', 4, 2),
    (17, 'Habilidades de comunicación', 5, 2),
    (17, 'Liderazgo y gestión de equipos', 6, 2);

    -- Insertar opciones de pregunta para la Pregunta 18
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (18, 'Proyectos tecnológicos', 3, 2),
    (18, 'Proyectos sociales y comunitarios', 10, 2),
    (18, 'Proyectos creativos y artísticos', 4, 2),
    (18, 'Proyectos de investigación', 2, 2),
    (18, 'Proyectos empresariales', 9, 2);

    -- Insertar opciones de pregunta para la Pregunta 19
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (19, 'Ciencias naturales', 2, 2),
    (19, 'Tecnología e innovación', 3, 2),
    (19, 'Arte y creatividad', 4, 2),
    (19, 'Comunicación y medios', 5, 2),
    (19, 'Impacto social', 10, 2);

    -- Insertar opciones de pregunta para la Pregunta 20
    INSERT INTO question_options (question_id, text, aptitude_id, weight) VALUES
    (20, 'Mejorar la calidad de vida de las personas', 10, 2),
    (20, 'Innovar en tecnología para la sociedad', 3, 2),
    (20, 'Crear proyectos artísticos con impacto social', 4, 2),
    (20, 'Educar y comunicar para el cambio', 5, 2),
    (20, 'Liderar iniciativas sociales', 6, 2);

    -- Insertar universidades 
    INSERT INTO universities (name, country, location, description, type, modality, website, email, rating) VALUES
    -- Universidades de Tunja 
    ('Universidad Pedagógica y Tecnológica de Colombia (UPTC)', 'Colombia', 'Tunja', 'Principal universidad pública de Boyacá con programas en ingenierías, educación y ciencias de la salud', 'publica', 'presencial', 'https://www.uptc.edu.co', 'contactenos@uptc.edu.co', 4.7),
    ('Universidad Santo Tomás - Seccional Tunja', 'Colombia', 'Tunja', 'Universidad privada con tradición católica y programas en derecho, ingenierías y salud', 'privada', 'presencial', 'https://www.ustatunja.edu.co', 'admisiones.tunja@usantoto.edu.co', 4.5),
    ('Universidad de Boyacá', 'Colombia', 'Tunja', 'Institución privada con acreditación de alta calidad en programas de ingeniería y salud', 'privada', 'presencial', 'https://www.uniboyaca.edu.co', 'admisiones@uniboyaca.edu.co', 4.3),
    ('Fundación Universitaria Juan de Castellanos', 'Colombia', 'Tunja', 'Universidad privada con énfasis en ciencias sociales, humanas y educación', 'privada', 'presencial', 'https://www.jdc.edu.co', 'admisiones@jdc.edu.co', 4.0),
    ('Corporación Universitaria Remington - Sede Tunja', 'Colombia', 'Tunja', 'Ofrece programas profesionales y tecnológicos con modalidad flexible', 'privada', 'mixta', 'https://www.remington.edu.co', 'tunja@remington.edu.co', 3.9),
    ('Universidad Nacional Abierta y a Distancia (UNAD) - CEAD Tunja', 'Colombia', 'Tunja', 'Educación pública a distancia con amplia cobertura en Boyacá', 'publica', 'virtual', 'https://www.unad.edu.co', 'ceadtunja@unad.edu.co', 4.2),

    -- Universidades de Bucaramanga
    ('Universidad Industrial de Santander (UIS)', 'Colombia', 'Bucaramanga', 'Principal universidad pública del oriente colombiano con énfasis en ingenierías y ciencias', 'publica', 'presencial', 'https://www.uis.edu.co', 'contacto@uis.edu.co', 4.6),
    ('Universidad Autónoma de Bucaramanga (UNAB)', 'Colombia', 'Bucaramanga', 'Universidad privada con programas en salud, ingenierías y negocios', 'privada', 'presencial', 'https://www.unab.edu.co', 'info@unab.edu.co', 4.4),
    ('Universidad de Santander (UDES)', 'Colombia', 'Bucaramanga', 'Institución privada con enfoque en investigación y desarrollo tecnológico', 'privada', 'presencial', 'https://www.udes.edu.co', 'admisiones@udes.edu.co', 4.1),

    -- Universidades de Bogotá
    ('Universidad Nacional de Colombia - Sede Bogotá', 'Colombia', 'Bogotá', 'Principal universidad pública del país con amplia oferta académica', 'publica', 'presencial', 'https://bogota.unal.edu.co', 'sede_bogota@unal.edu.co', 4.8),
    ('Universidad de los Andes', 'Colombia', 'Bogotá', 'Universidad privada líder en investigación y excelencia académica', 'privada', 'presencial', 'https://uniandes.edu.co', 'info@uniandes.edu.co', 4.9),
    ('Pontificia Universidad Javeriana', 'Colombia', 'Bogotá', 'Universidad privada con tradición jesuita y enfoque humanista', 'privada', 'presencial', 'https://www.javeriana.edu.co', 'contacto@javeriana.edu.co', 4.7);
    -- Insert carreras 

    INSERT INTO careers (university_id, name, description, duration_years) VALUES
    -- Colección única de carreras presentes en todas las universidades 
    -- CIENCIAS DE LA SALUD
    ('Medicina', 'Formación integral en ciencias de la salud y atención médica.', 6),
    ('Odontología', 'Prevención y tratamiento de enfermedades bucales.', 5),
    ('Enfermería', 'Atención y cuidado de la salud de las personas.', 5),
    ('Fisioterapia', 'Rehabilitación física y promoción de la salud.', 5),
    ('Nutrición y Dietética', 'Alimentación saludable y prevención de enfermedades.', 5),
    ('Ingeniería Biomédica', 'Aplicación de tecnología en el área de la salud.', 5),

    -- INGENIERÍAS
    ('Ingeniería de Sistemas', 'Formación en desarrollo de software, redes y sistemas informáticos.', 5),
    ('Ingeniería Industrial', 'Gestión de procesos productivos y optimización de recursos.', 5),
    ('Ingeniería Civil', 'Diseño y construcción de obras de infraestructura.', 5),
    ('Ingeniería Electrónica', 'Desarrollo de sistemas electrónicos y automatización.', 5),
    ('Ingeniería Mecánica', 'Diseño y mantenimiento de sistemas mecánicos.', 5),
    ('Ingeniería Química', 'Procesos industriales y desarrollo de productos químicos.', 5),
    ('Ingeniería Eléctrica', 'Sistemas eléctricos y generación de energía.', 5),
    ('Ingeniería Ambiental', 'Gestión y protección del medio ambiente y recursos naturales.', 5),
    ('Ingeniería de Telecomunicaciones', 'Sistemas de comunicación y redes.', 5),
    ('Ingeniería de Alimentos', 'Procesos de producción y control de calidad alimentaria.', 5),
    ('Ingeniería de Petróleos', 'Exploración y producción de hidrocarburos.', 5),
    ('Ingeniería Agronómica', 'Producción agrícola y gestión rural.', 5),
    ('Ingeniería de Minas', 'Explotación y gestión de recursos minerales.', 5),
    ('Ingeniería Forestal', 'Gestión y conservación de recursos forestales.', 5),
    ('Ingeniería Geológica', 'Estudio de la tierra y sus recursos.', 5),
    ('Ingeniería de Transporte', 'Planificación y gestión de sistemas de transporte.', 5),
    ('Ingeniería Naval', 'Diseño y construcción de embarcaciones.', 5),
    ('Ingeniería Mecatrónica', 'Integración de sistemas mecánicos, electrónicos y de control.', 5),
    ('Ingeniería en Energías Renovables', 'Desarrollo de tecnologías para energías limpias.', 5),
    ('Ingeniería en Software', 'Desarrollo y gestión de aplicaciones informáticas.', 5),
    ('Ingeniería en Automatización', 'Diseño de sistemas automáticos y robóticos.', 5),
    ('Ingeniería en Gestión Ambiental', 'Planificación y gestión de proyectos ambientales.', 5),
    ('Ingeniería en Logística', 'Optimización de cadenas de suministro y distribución.', 5),
    ('Ingeniería en Producción', 'Gestión de procesos productivos industriales.', 5),
    ('Ingeniería en Telecomunicaciones y Redes', 'Diseño y gestión de infraestructuras de comunicación.', 5),
    ('Ingeniería en Diseño Industrial', 'Desarrollo de productos y procesos de manufactura.', 5),
    ('Ingeniería en Ciencias de Datos', 'Análisis y procesamiento de grandes volúmenes de datos.', 5),
    ('Ingeniería en Inteligencia Artificial', 'Desarrollo de sistemas inteligentes y automatizados.', 5),
    ('Ingeniería en Biotecnología', 'Aplicación de procesos biológicos en la industria.', 5),

    -- CIENCIAS SOCIALES Y HUMANIDADES
    ('Derecho', 'Estudios jurídicos y formación en leyes y justicia.', 5),
    ('Psicología', 'Estudio del comportamiento humano y procesos mentales.', 5),
    ('Comunicación Social', 'Formación en medios, periodismo y relaciones públicas.', 5),
    ('Trabajo Social', 'Intervención y apoyo a comunidades y personas vulnerables.', 5),
    ('Economía', 'Análisis económico y gestión financiera.', 5),
    ('Administración Pública', 'Gestión de instituciones y políticas públicas.', 5),
    ('Filosofía', 'Estudio de las preguntas fundamentales sobre la existencia, el conocimiento y la ética.', 5),
    ('Historia', 'Análisis de eventos históricos y su impacto en la sociedad.', 5),
    ('Literatura', 'Estudio de obras literarias y desarrollo de habilidades de escritura.', 5),
    ('Antropología', 'Investigación de culturas, sociedades y comportamientos humanos.', 5),
    ('Sociología', 'Análisis de estructuras sociales y relaciones humanas.', 5),
    ('Ciencias Políticas', 'Estudio de sistemas políticos, teorías y prácticas gubernamentales.', 5),

    -- ADMINISTRACIÓN Y NEGOCIOS
    ('Administración de Empresas', 'Gestión empresarial, finanzas y recursos humanos.', 5),
    ('Contaduría Pública', 'Gestión contable, auditoría y finanzas.', 5),
    ('Ingeniería en Gestión Empresarial', 'Administración y dirección de empresas industriales.', 5),
    ('Ingeniería en Gestión de Proyectos', 'Planificación y dirección de proyectos tecnológicos.', 5),

    -- ARQUITECTURA Y DISEÑO
    ('Arquitectura', 'Diseño y construcción de espacios habitables.', 5),
    ('Diseño Gráfico', 'Creación de piezas visuales y comunicación gráfica.', 5),

    -- ARTES
    ('Música', 'Formación en interpretación, composición y teoría musical.', 5),
    ('Artes Plásticas', 'Desarrollo de habilidades en pintura, escultura y otras artes visuales.', 5),
    ('Cine y Televisión', 'Producción audiovisual, dirección y guion.', 5),
    ('Danza', 'Formación en técnicas de danza y expresión corporal.', 5),

    -- EDUCACIÓN
    ('Educación', 'Formación de docentes y gestión educativa.', 5)

    -- Insert relaciones carrera-aptitud (NO universidad-aptitud)
    INSERT INTO career_aptitudes (career_id, aptitude_id, importance_level) VALUES
    --
    -- CIENCIAS DE LA SALUD
    (1, 2, 'high'),   -- Medicina - Ciencias
    (1, 7, 'high'),   -- Medicina - Análisis
    (1, 10, 'medium'),-- Medicina - Servicio Social
    (2, 2, 'high'),   -- Odontología - Ciencias
    (2, 7, 'medium'), -- Odontología - Análisis
    (3, 10, 'high'),  -- Enfermería - Servicio Social
    (3, 8, 'medium'), -- Enfermería - Trabajo en Equipo
    (4, 2, 'high'),   -- Fisioterapia - Ciencias
    (4, 10, 'medium'),-- Fisioterapia - Servicio Social
    (5, 2, 'high'),   -- Nutrición y Dietética - Ciencias
    (5, 7, 'medium'), -- Nutrición y Dietética - Análisis
    (6, 3, 'high'),   -- Ingeniería Biomédica - Tecnología
    (6, 2, 'medium'), -- Ingeniería Biomédica - Ciencias

    -- INGENIERÍAS
    (7, 3, 'high'),   -- Ingeniería de Sistemas - Tecnología
    (7, 1, 'high'),   -- Ingeniería de Sistemas - Matemáticas
    (7, 7, 'medium'), -- Ingeniería de Sistemas - Análisis
    (8, 1, 'high'),   -- Ingeniería Industrial - Matemáticas
    (8, 7, 'high'),   -- Ingeniería Industrial - Análisis
    (8, 9, 'medium'), -- Ingeniería Industrial - Emprendimiento
    (9, 1, 'high'),   -- Ingeniería Civil - Matemáticas
    (9, 7, 'high'),   -- Ingeniería Civil - Análisis
    (10, 3, 'high'),  -- Ingeniería Electrónica - Tecnología
    (10, 1, 'medium'),-- Ingeniería Electrónica - Matemáticas
    (11, 1, 'high'),  -- Ingeniería Mecánica - Matemáticas
    (11, 3, 'medium'),-- Ingeniería Mecánica - Tecnología
    (12, 2, 'high'),  -- Ingeniería Química - Ciencias
    (12, 1, 'medium'),-- Ingeniería Química - Matemáticas
    (13, 1, 'high'),  -- Ingeniería Eléctrica - Matemáticas
    (13, 3, 'high'),  -- Ingeniería Eléctrica - Tecnología
    (14, 2, 'high'),  -- Ingeniería Ambiental - Ciencias
    (14, 10, 'medium'),-- Ingeniería Ambiental - Servicio Social
    (15, 3, 'high'),  -- Ingeniería de Telecomunicaciones - Tecnología
    (15, 1, 'medium'),-- Ingeniería de Telecomunicaciones - Matemáticas
    (16, 2, 'high'),  -- Ingeniería de Alimentos - Ciencias
    (16, 7, 'medium'),-- Ingeniería de Alimentos - Análisis
    (17, 2, 'high'),  -- Ingeniería de Petróleos - Ciencias
    (17, 1, 'medium'),-- Ingeniería de Petróleos - Matemáticas
    (18, 2, 'high'),  -- Ingeniería Agronómica - Ciencias
    (18, 10, 'medium'),-- Ingeniería Agronómica - Servicio Social
    (19, 2, 'high'),  -- Ingeniería de Minas - Ciencias
    (19, 7, 'medium'),-- Ingeniería de Minas - Análisis
    (20, 2, 'high'),  -- Ingeniería Forestal - Ciencias
    (20, 10, 'medium'),-- Ingeniería Forestal - Servicio Social
    (21, 2, 'high'),  -- Ingeniería Geológica - Ciencias
    (21, 1, 'medium'),-- Ingeniería Geológica - Matemáticas
    (22, 7, 'high'),  -- Ingeniería de Transporte - Análisis
    (22, 1, 'medium'),-- Ingeniería de Transporte - Matemáticas
    (23, 3, 'high'),  -- Ingeniería Naval - Tecnología
    (23, 1, 'medium'),-- Ingeniería Naval - Matemáticas
    (24, 3, 'high'),  -- Ingeniería Mecatrónica - Tecnología
    (24, 1, 'medium'),-- Ingeniería Mecatrónica - Matemáticas
    (25, 3, 'high'),  -- Ingeniería en Energías Renovables - Tecnología
    (25, 2, 'high'),  -- Ingeniería en Energías Renovables - Ciencias
    (26, 3, 'high'),  -- Ingeniería en Software - Tecnología
    (26, 1, 'high'),  -- Ingeniería en Software - Matemáticas
    (27, 3, 'high'),  -- Ingeniería en Automatización - Tecnología
    (27, 1, 'medium'),-- Ingeniería en Automatización - Matemáticas
    (28, 2, 'high'),  -- Ingeniería en Gestión Ambiental - Ciencias
    (28, 10, 'medium'),-- Ingeniería en Gestión Ambiental - Servicio Social
    (29, 7, 'high'),  -- Ingeniería en Logística - Análisis
    (29, 8, 'medium'),-- Ingeniería en Logística - Trabajo en Equipo
    (30, 7, 'high'),  -- Ingeniería en Producción - Análisis
    (30, 1, 'medium'),-- Ingeniería en Producción - Matemáticas
    (31, 3, 'high'),  -- Ingeniería en Telecomunicaciones y Redes - Tecnología
    (31, 1, 'medium'),-- Ingeniería en Telecomunicaciones y Redes - Matemáticas
    (32, 4, 'high'),  -- Ingeniería en Diseño Industrial - Arte y Creatividad
    (32, 3, 'medium'),-- Ingeniería en Diseño Industrial - Tecnología
    (33, 3, 'high'),  -- Ingeniería en Ciencias de Datos - Tecnología
    (33, 1, 'high'),  -- Ingeniería en Ciencias de Datos - Matemáticas
    (34, 3, 'high'),  -- Ingeniería en Inteligencia Artificial - Tecnología
    (34, 1, 'high'),  -- Ingeniería en Inteligencia Artificial - Matemáticas
    (35, 2, 'high'),  -- Ingeniería en Biotecnología - Ciencias
    (35, 3, 'medium'),-- Ingeniería en Biotecnología - Tecnología

    -- CIENCIAS SOCIALES Y HUMANIDADES
    (36, 6, 'high'),  -- Derecho - Liderazgo
    (36, 5, 'high'),  -- Derecho - Comunicación
    (37, 7, 'high'),  -- Psicología - Análisis
    (37, 10, 'high'), -- Psicología - Servicio Social
    (38, 5, 'high'),  -- Comunicación Social - Comunicación
    (38, 4, 'medium'),-- Comunicación Social - Arte y Creatividad
    (39, 10, 'high'), -- Trabajo Social - Servicio Social
    (39, 8, 'medium'),-- Trabajo Social - Trabajo en Equipo
    (40, 7, 'high'),  -- Economía - Análisis
    (40, 1, 'high'),  -- Economía - Matemáticas
    (41, 6, 'high'),  -- Administración Pública - Liderazgo
    (41, 10, 'medium'),-- Administración Pública - Servicio Social
    (42, 7, 'high'),  -- Filosofía - Análisis
    (42, 5, 'medium'),-- Filosofía - Comunicación
    (43, 7, 'high'),  -- Historia - Análisis
    (43, 5, 'medium'),-- Historia - Comunicación
    (44, 5, 'high'),  -- Literatura - Comunicación
    (44, 4, 'medium'),-- Literatura - Arte y Creatividad
    (45, 7, 'high'),  -- Antropología - Análisis
    (45, 10, 'medium'),-- Antropología - Servicio Social
    (46, 7, 'high'),  -- Sociología - Análisis
    (46, 10, 'medium'),-- Sociología - Servicio Social
    (47, 6, 'high'),  -- Ciencias Políticas - Liderazgo
    (47, 7, 'high'),  -- Ciencias Políticas - Análisis

    -- ADMINISTRACIÓN Y NEGOCIOS
    (48, 6, 'high'),  -- Administración de Empresas - Liderazgo
    (48, 9, 'high'),  -- Administración de Empresas - Emprendimiento
    (49, 7, 'high'),  -- Contaduría Pública - Análisis
    (49, 1, 'high'),  -- Contaduría Pública - Matemáticas
    (50, 6, 'high'),  -- Ingeniería en Gestión Empresarial - Liderazgo
    (50, 9, 'high'),  -- Ingeniería en Gestión Empresarial - Emprendimiento
    (51, 7, 'high'),  -- Ingeniería en Gestión de Proyectos - Análisis
    (51, 6, 'high'),  -- Ingeniería en Gestión de Proyectos - Liderazgo

    -- ARQUITECTURA Y DISEÑO
    (52, 4, 'high'),  -- Arquitectura - Arte y Creatividad
    (52, 3, 'medium'),-- Arquitectura - Tecnología
    (53, 4, 'high'),  -- Diseño Gráfico - Arte y Creatividad
    (53, 5, 'medium'),-- Diseño Gráfico - Comunicación

    -- ARTES
    (54, 4, 'high'),  -- Música - Arte y Creatividad
    (54, 5, 'medium'),-- Música - Comunicación
    (55, 4, 'high'),  -- Artes Plásticas - Arte y Creatividad
    (56, 4, 'high'),  -- Cine y Televisión - Arte y Creatividad
    (56, 5, 'medium'),-- Cine y Televisión - Comunicación
    (57, 4, 'high'),  -- Danza - Arte y Creatividad

    -- EDUCACIÓN
    (58, 10, 'high'), -- Educación - Servicio Social
    (58, 5, 'high'),  -- Educación - Comunicación
    (58, 8, 'medium');-- Educación - Trabajo en Equipo


    -- Relacionar universidades con aptitudes (university_aptitudes)
    INSERT INTO university_aptitudes (university_id, aptitude_id) VALUES

    -- Universidad Pedagógica y Tecnológica de Colombia (UPTC)
    (1, 1), -- Matemáticas
    (1, 2), -- Ciencias
    (1, 3), -- Tecnología
    (1, 4), -- Arte y Creatividad
    (1, 5), -- Comunicación
    (1, 6), -- Liderazgo
    (1, 7), -- Análisis
    (1, 8), -- Trabajo en Equipo
    (1, 9), -- Emprendimiento
    (1, 10), -- Servicio Social

    -- Universidad Santo Tomás - Seccional Tunja
    (2, 1), -- Matemáticas
    (2, 2), -- Ciencias
    (2, 3), -- Tecnología
    (2, 4), -- Arte y Creatividad
    (2, 5), -- Comunicación
    (2, 6), -- Liderazgo
    (2, 7), -- Análisis
    (2, 8), -- Trabajo en Equipo
    (2, 9), -- Emprendimiento
    (2, 10), -- Servicio Social

    -- Universidad de Boyacá
    (3, 1), -- Matemáticas
    (3, 2), -- Ciencias
    (3, 3), -- Tecnología
    (3, 4), -- Arte y Creatividad
    (3, 5), -- Comunicación
    (3, 6), -- Liderazgo
    (3, 7), -- Análisis
    (3, 8), -- Trabajo en Equipo
    (3, 9), -- Emprendimiento
    (3, 10), -- Servicio Social

    -- Fundación Universitaria Juan de Castellanos
    (4, 1), -- Matemáticas
    (4, 2), -- Ciencias
    (4, 3), -- Tecnología
    (4, 4), -- Arte y Creatividad
    (4, 5), -- Comunicación
    (4, 6), -- Liderazgo
    (4, 7), -- Análisis
    (4, 8), -- Trabajo en Equipo
    (4, 9), -- Emprendimiento
    (4, 10), -- Servicio Social

    -- Corporación Universitaria Remington - Sede Tunja
    (5, 1), -- Matemáticas
    (5, 2), -- Ciencias
    (5, 3), -- Tecnología
    (5, 4), -- Arte y Creatividad
    (5, 5), -- Comunicación
    (5, 6), -- Liderazgo
    (5, 7), -- Análisis
    (5, 8), -- Trabajo en Equipo
    (5, 9), -- Emprendimiento
    (5, 10), -- Servicio Social

    -- Universidad Nacional Abierta y a Distancia (UNAD) - CEAD Tunja
    (6, 1), -- Matemáticas
    (6, 2), -- Ciencias
    (6, 3), -- Tecnología
    (6, 4), -- Arte y Creatividad
    (6, 5), -- Comunicación
    (6, 6), -- Liderazgo
    (6, 7), -- Análisis
    (6, 8), -- Trabajo en Equipo
    (6, 9), -- Emprendimiento
    (6, 10), -- Servicio Social

    -- Universidad Industrial de Santander (UIS)
    (7, 1), -- Matemáticas
    (7, 2), -- Ciencias
    (7, 3), -- Tecnología
    (7, 4), -- Arte y Creatividad
    (7, 5), -- Comunicación
    (7, 6), -- Liderazgo
    (7, 7), -- Análisis
    (7, 8), -- Trabajo en Equipo
    (7, 9), -- Emprendimiento
    (7, 10), -- Servicio Social

    -- Universidad Autónoma de Bucaramanga (UNAB)
    (8, 1), -- Matemáticas
    (8, 2), -- Ciencias
    (8, 3), -- Tecnología
    (8, 4), -- Arte y Creatividad
    (8, 5), -- Comunicación
    (8, 6), -- Liderazgo
    (8, 7), -- Análisis
    (8, 8), -- Trabajo en Equipo
    (8, 9), -- Emprendimiento
    (8, 10), -- Servicio Social

    -- Universidad de Santander (UDES)
    (9, 1), -- Matemáticas
    (9, 2), -- Ciencias
    (9, 3), -- Tecnología
    (9, 4), -- Arte y Creatividad
    (9, 5), -- Comunicación
    (9, 6), -- Liderazgo
    (9, 7), -- Análisis
    (9, 8), -- Trabajo en Equipo
    (9, 9), -- Emprendimiento
    (9, 10), -- Servicio Social

    -- Universidad Nacional de Colombia - Sede Bogotá
    (10, 1), -- Matemáticas
    (10, 2), -- Ciencias
    (10, 3), -- Tecnología
    (10, 4), -- Arte y Creatividad
    (10, 5), -- Comunicación
    (10, 6), -- Liderazgo
    (10, 7), -- Análisis
    (10, 8), -- Trabajo en Equipo
    (10, 9), -- Emprendimiento
    (10, 10), -- Servicio Social

    -- Universidad de los Andes
    (11, 1), -- Matemáticas
    (11, 2), -- Ciencias
    (11, 3), -- Tecnología
    (11, 4), -- Arte y Creatividad
    (11, 5), -- Comunicación
    (11, 6), -- Liderazgo
    (11, 7), -- Análisis
    (11, 8), -- Trabajo en Equipo
    (11, 9), -- Emprendimiento
    (11, 10), -- Servicio Social

    -- Pontificia Universidad Javeriana
    (12, 1), -- Matemáticas
    (12, 2), -- Ciencias
    (12, 3), -- Tecnología
    (12, 4), -- Arte y Creatividad
    (12, 5), -- Comunicación
    (12, 6), -- Liderazgo
    (12, 7), -- Análisis
    (12, 8), -- Trabajo en Equipo
    (12, 9), -- Emprendimiento
    (12, 10); -- Servicio Social



    -- Crear usuario administrador por defecto
    INSERT INTO users (name, email, password, role) VALUES
    ('Administrador', 'admin@vocationalapp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'admin');
    -- Contraseña: admin123

    -- Crear usuario de prueba
    INSERT INTO users (name, email, password, age, location, education_level, interests) VALUES
    ('Juan Pérez', 'juan@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 20, 'Buenos Aires, Argentina', 'Secundario Completo', 'Tecnología, programación, videojuegos');
    -- Contraseña: test123
