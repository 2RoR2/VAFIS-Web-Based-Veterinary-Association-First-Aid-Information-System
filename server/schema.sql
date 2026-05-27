CREATE DATABASE IF NOT EXISTS vafis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vafis;

CREATE TABLE IF NOT EXISTS guides (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  species JSON NOT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  readTime VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  lastReviewed VARCHAR(64) NOT NULL,
  reviewedBy VARCHAR(255) NOT NULL,
  steps JSON NOT NULL,
  warnings JSON NOT NULL,
  relatedVideos JSON NOT NULL,
  relatedGuides JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(32) NOT NULL,
  species VARCHAR(64) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  thumbnail VARCHAR(64) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
  views INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  species VARCHAR(64) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
  passingScore INT NOT NULL,
  questions JSON NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinics (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  hours VARCHAR(128) NOT NULL,
  hoursDetail JSON NOT NULL,
  distance VARCHAR(64) NOT NULL,
  isOpen TINYINT(1) NOT NULL DEFAULT 0,
  isEmergency TINYINT(1) NOT NULL DEFAULT 0,
  services JSON NOT NULL,
  species JSON NOT NULL,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
  reviews INT NOT NULL DEFAULT 0,
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6)
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  available VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(64) PRIMARY KEY,
  contentType VARCHAR(64) NOT NULL,
  contentTitle VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  submittedBy VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  submittedAt VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  audience VARCHAR(255) NOT NULL,
  event VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  timestamp VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255) NOT NULL,
  timestamp VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('user', 'professional', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
