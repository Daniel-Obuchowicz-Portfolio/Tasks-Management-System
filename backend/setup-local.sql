CREATE DATABASE IF NOT EXISTS management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE management_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL,
  dob DATE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  assignedUsers JSON NOT NULL,
  priority VARCHAR(30) NOT NULL,
  dueDate DATETIME NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS events (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date DATETIME NOT NULL,
  userIds TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO users (firstName, lastName, email, dob, username, password, role)
SELECT 'Admin', 'Local', 'admin@example.com', '1990-01-01', 'admin', '$2b$10$ZwRuMoLiNxGZtR1cgXatJetdUqi0PWnHETBEfl0pWftkN1w21TaDa', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
