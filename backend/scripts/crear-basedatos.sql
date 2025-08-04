-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS vocational_discovery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vocational_discovery;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    location VARCHAR(255),
    education_level VARCHAR(100),
    interests TEXT,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Tabla de aptitudes
CREATE TABLE IF NOT EXISTS aptitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text TEXT NOT NULL,
    category VARCHAR(100),
    question_order INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_order (question_order)
);

-- Opciones de preguntas
CREATE TABLE IF NOT EXISTS question_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    text TEXT NOT NULL,
    aptitude_id INT,
    weight DECIMAL(3,2) DEFAULT 1.00,
    option_order INT,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE SET NULL,
    INDEX idx_question (question_id)
);

-- Resultados de test
CREATE TABLE IF NOT EXISTS test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score DECIMAL(5,2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_completed (completed_at)
);

-- Respuestas de test
CREATE TABLE IF NOT EXISTS test_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT NOT NULL,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE CASCADE,
    INDEX idx_test_result (test_result_id)
);

-- Puntajes de aptitudes por test
CREATE TABLE IF NOT EXISTS test_aptitude_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    aptitude_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE CASCADE,
    INDEX idx_test_result (test_result_id),
    INDEX idx_aptitude (aptitude_id)
);

-- Universidades
CREATE TABLE IF NOT EXISTS universities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    description TEXT,
    type ENUM('publica', 'privada') DEFAULT 'publica',
    modality ENUM('presencial', 'virtual', 'mixta') DEFAULT 'presencial',
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_type (type),
    INDEX idx_rating (rating)
);

-- Carreras
CREATE TABLE IF NOT EXISTS careers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_years INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    INDEX idx_university (university_id)
);

-- Relación carrera-aptitud (muchos a muchos)
CREATE TABLE IF NOT EXISTS career_aptitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    career_id INT NOT NULL,
    aptitude_id INT NOT NULL,
    importance_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_career_aptitude (career_id, aptitude_id),
    INDEX idx_career (career_id),
    INDEX idx_aptitude (aptitude_id)
);

-- Relación universidad-aptitud (muchos a muchos)
CREATE TABLE IF NOT EXISTS university_aptitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT NOT NULL,
    aptitude_id INT NOT NULL,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    FOREIGN KEY (aptitude_id) REFERENCES aptitudes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_university_aptitude (university_id, aptitude_id)
);

-- Recomendaciones de universidades
CREATE TABLE IF NOT EXISTS university_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    university_id INT NOT NULL,
    match_percentage DECIMAL(5,2) NOT NULL,
    recommended_careers JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    INDEX idx_test_result (test_result_id),
    INDEX idx_university (university_id),
    INDEX idx_match_percentage (match_percentage)
);
