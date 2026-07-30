-- ============================================================================
-- CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)
-- Faculty of Technology & Engineering (FTE) - ITUE203 Web Development Frameworks
-- Relational MySQL Schema for StudentHub e-Governance Portal
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `studenthub_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `studenthub_db`;

-- 1. Users Table (Role-Based Access Control: admin / student)
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `remember_token` VARCHAR(255) DEFAULT NULL,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Students Table
CREATE TABLE `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `enrollment_no` VARCHAR(20) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `department` VARCHAR(100) NOT NULL,
    `year_of_study` VARCHAR(20) NOT NULL,
    `gpa` DECIMAL(3,2) DEFAULT '0.00',
    `phone_number` VARCHAR(15) DEFAULT NULL,
    `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    `status` ENUM('Active', 'Inactive', 'SoftDeleted') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Events Table (Event Management with poster upload)
CREATE TABLE `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `event_date` DATE NOT NULL,
    `event_time` VARCHAR(20) NOT NULL,
    `venue` VARCHAR(150) NOT NULL,
    `total_seats` INT NOT NULL DEFAULT 100,
    `registered_count` INT NOT NULL DEFAULT 0,
    `poster_path` VARCHAR(255) DEFAULT 'charusat-logo.jpg',
    `description` TEXT NOT NULL,
    `status` ENUM('Open', 'Closed', 'Archived') DEFAULT 'Open',
    `organizer` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Event Registrations Table
CREATE TABLE `registrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('Confirmed', 'Cancelled', 'Waitlisted') DEFAULT 'Confirmed',
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_event_student` (`event_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Contact & Feedback Submissions
CREATE TABLE `contact_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `country` VARCHAR(50) DEFAULT NULL,
    `state` VARCHAR(50) DEFAULT NULL,
    `city` VARCHAR(50) DEFAULT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `rating` INT DEFAULT 5,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Audit Logs Table (Administrative Traceability)
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `user_role` VARCHAR(20) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Notices & Announcements Table
CREATE TABLE `notices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `urgency` ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    `content` TEXT NOT NULL,
    `published_date` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- Seed Data Initialization
-- Passwords: 
-- Admin: AdminPass123! ($2y$10$e8c1QvY6u5O... standard password_hash)
-- Student: Password123!
-- ============================================================================

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `status`) VALUES
(1, 'ADMIN001', 'admin@charusat.ac.in', '$2y$10$w09ZkP.J/zI0jYmS.u95g.2q00gXN1tY6J3lH.rT5cW7pM9lK3lHe', 'System Administrator', 'admin', 'active'),
(2, '25CS009', 'dhruvrajsinhdodiya4208@gmail.com', '$2y$10$K9Wb2zU8H4/o3B2kY50rTu9xM.1Q.mJ8lK0H1sW.pG9uR1fE2lKHe', 'Dhruvrajsinh Dodiya', 'student', 'active');

INSERT INTO `students` (`id`, `user_id`, `enrollment_no`, `full_name`, `email`, `department`, `year_of_study`, `gpa`, `phone_number`, `gender`, `status`) VALUES
(1, NULL, '25CS001', 'Aarav Patel', 'aarav.cs001@charusat.edu.in', 'Computer Engineering', '3rd Year', 9.12, '9876543210', 'Male', 'Active'),
(2, NULL, '25CS002', 'Ananya Sharma', 'ananya.cs002@charusat.edu.in', 'Computer Engineering', '3rd Year', 8.85, '9876543211', 'Female', 'Active'),
(3, NULL, '25CS003', 'Bhavya Shah', 'bhavya.cs003@charusat.edu.in', 'Information Technology', '3rd Year', 7.90, '9876543212', 'Male', 'Active'),
(4, NULL, '25CS004', 'Devansh Joshi', 'devansh.cs004@charusat.edu.in', 'Computer Engineering', '3rd Year', 8.45, '9876543213', 'Male', 'Active'),
(5, 2, '25CS009', 'Dhruvrajsinh Dodiya', 'dhruvrajsinhdodiya4208@gmail.com', 'Computer Engineering', '3rd Year', 9.45, '9898989898', 'Male', 'Active');

INSERT INTO `events` (`id`, `title`, `category`, `event_date`, `event_time`, `venue`, `total_seats`, `registered_count`, `poster_path`, `description`, `status`, `organizer`) VALUES
(1, 'TechVista 2026 - Annual Tech Fest', 'Technical', '2026-09-15', '09:00 AM', 'CHARUSAT Auditorium & Labs', 350, 210, 'charusat-logo.jpg', 'Flagship annual technical festival.', 'Open', 'CSPIT Computer Dept'),
(2, 'AI & Deep Learning National Workshop', 'Workshop', '2026-08-22', '10:30 AM', 'Seminar Hall 506', 120, 95, 'charusat-logo.jpg', 'Hands-on neural networks & vision bootcamp.', 'Open', 'DEPSTAR AI Club');

INSERT INTO `audit_logs` (`id`, `user_id`, `user_role`, `action`, `details`, `ip_address`) VALUES
(1, 1, 'admin', 'SYSTEM_INITIALIZATION', 'Database schema initialized with seed values.', '127.0.0.1'),
(2, 2, 'student', 'USER_LOGIN', 'Student Dhruvrajsinh Dodiya logged in successfully.', '127.0.0.1');
