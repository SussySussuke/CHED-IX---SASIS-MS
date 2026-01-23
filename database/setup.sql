-- CHED HEI System Database Setup
-- This will drop and recreate the database with all tables and sample data

-- Drop and recreate database
DROP DATABASE IF EXISTS ched_hei_system;
CREATE DATABASE ched_hei_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ched_hei_system;

-- Drop old tables if exists (in reverse order of creation to respect foreign keys)
DROP TABLE IF EXISTS annex_o_programs;
DROP TABLE IF EXISTS annex_o_batches;
DROP TABLE IF EXISTS annex_n_activities;
DROP TABLE IF EXISTS annex_n_batches;
DROP TABLE IF EXISTS annex_m_services;
DROP TABLE IF EXISTS annex_m_statistics;
DROP TABLE IF EXISTS annex_m_batches;
DROP TABLE IF EXISTS annex_l_housings;
DROP TABLE IF EXISTS annex_l_batches;
DROP TABLE IF EXISTS annex_k_committees;
DROP TABLE IF EXISTS annex_k_batches;
DROP TABLE IF EXISTS annex_j_programs;
DROP TABLE IF EXISTS annex_j_batches;
DROP TABLE IF EXISTS annex_i_scholarships;
DROP TABLE IF EXISTS annex_i_batches;
DROP TABLE IF EXISTS annex_h_admission_statistics;
DROP TABLE IF EXISTS annex_h_admission_services;
DROP TABLE IF EXISTS annex_h_batches;
DROP TABLE IF EXISTS annex_g_programs;
DROP TABLE IF EXISTS annex_g_other_publications;
DROP TABLE IF EXISTS annex_g_editorial_boards;
DROP TABLE IF EXISTS annex_g_submissions;
DROP TABLE IF EXISTS annex_f_activities;
DROP TABLE IF EXISTS annex_f_batches;
DROP TABLE IF EXISTS annex_e_organizations;
DROP TABLE IF EXISTS annex_e_batches;
DROP TABLE IF EXISTS annex_d_submissions;
DROP TABLE IF EXISTS annex_c_programs;
DROP TABLE IF EXISTS annex_c_batches;
DROP TABLE IF EXISTS annex_b_programs;
DROP TABLE IF EXISTS annex_b_batches;
DROP TABLE IF EXISTS annex_a_programs;
DROP TABLE IF EXISTS annex_a_batches;
DROP TABLE IF EXISTS summary;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS heis;

-- HEIs table
CREATE TABLE heis (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uii VARCHAR(6) UNIQUE NULL COMMENT 'Unique Institution Identifier',
    name VARCHAR(255) NOT NULL,
    type ENUM('Private', 'SUC', 'LUC') NOT NULL,
    code VARCHAR(50) UNIQUE NULL COMMENT 'Optional unique HEI code',
    email VARCHAR(255) NULL COMMENT 'Institutional email',
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_uii (uii)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_type ENUM('superadmin', 'admin', 'hei') NOT NULL,
    hei_id BIGINT UNSIGNED NULL COMMENT 'Only for HEI users',
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_account_type (account_type),
    INDEX idx_hei_id (hei_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Summary table (institutional information)
CREATE TABLE summary (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    population_male INT UNSIGNED DEFAULT 0,
    population_female INT UNSIGNED DEFAULT 0,
    population_intersex INT UNSIGNED DEFAULT 0,
    population_total INT UNSIGNED DEFAULT 0,
    submitted_org_chart VARCHAR(10) NULL,
    hei_website VARCHAR(255) NULL,
    sas_website VARCHAR(255) NULL,
    social_media_contacts JSON NULL,
    student_handbook VARCHAR(255) NULL,
    student_publication VARCHAR(255) NULL,
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data
-- SuperAdmin account (Password: password)
INSERT INTO users (name, email, password, account_type, created_at, updated_at)
VALUES ('Super Admin', 'superadmin@ched.gov.ph', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5uIYBvNXZIm', 'superadmin', NOW(), NOW());

-- Sample HEIs
INSERT INTO heis (uii, name, type, code, email, phone, address, is_active, created_at, updated_at) VALUES
('000001', 'University of the Philippines', 'SUC', 'UP', 'contact@up.edu.ph', '02-8981-8500', 'Diliman, Quezon City', TRUE, NOW(), NOW()),
('000002', 'De La Salle University', 'Private', 'DLSU', 'info@dlsu.edu.ph', '02-8524-4611', '2401 Taft Avenue, Manila', TRUE, NOW(), NOW()),
('000003', 'Ateneo de Manila University', 'Private', 'ADMU', 'info@ateneo.edu', '02-8426-6001', 'Loyola Heights, Quezon City', TRUE, NOW(), NOW());

-- Sample HEI Users (Password: password)
INSERT INTO users (name, email, password, account_type, hei_id, created_at, updated_at) VALUES
('UP Admin', 'admin@up.edu.ph', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5uIYBvNXZIm', 'hei', 1, NOW(), NOW()),
('DLSU Admin', 'admin@dlsu.edu.ph', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5uIYBvNXZIm', 'hei', 2, NOW(), NOW()),
('ADMU Admin', 'admin@ateneo.edu', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5uIYBvNXZIm', 'hei', 3, NOW(), NOW());

-- Settings Data
INSERT INTO settings (`key`, value, created_at, updated_at) VALUES
('annual_submission_deadline', CONCAT(YEAR(NOW()), '-09-01 00:00:00'), NOW(), NOW()),
('maintenance_mode', '0', NOW(), NOW());

-- Sample Data for Summary
INSERT INTO summary (hei_id, academic_year, status, population_male, population_female, population_intersex, population_total, submitted_org_chart, hei_website, sas_website, social_media_contacts, student_handbook, student_publication, created_at, updated_at) VALUES
(1, '2024-2025', 'published', 12000, 13500, 50, 25550, 'yes', 'https://up.edu.ph', 'https://sas.up.edu.ph', '["facebook.com/upofficial", "twitter.com/up_diliman", "sas@up.edu.ph"]', '2024 Edition', 'Philippine Collegian', NOW(), NOW()),
(2, '2024-2025', 'submitted', 8500, 9200, 30, 17730, 'yes', 'https://dlsu.edu.ph', 'https://studentaffairs.dlsu.edu.ph', '["facebook.com/dlsumanila", "info@dlsu.edu.ph"]', 'January 2024', 'The Lasallian', NOW(), NOW()),
(3, '2024-2025', 'published', 7800, 8600, 25, 16425, 'yes', 'https://ateneo.edu', 'https://osa.ateneo.edu', '["facebook.com/ateneoofficial", "osa@ateneo.edu"]', '2024-2025 Academic Year', 'The Guidon', NOW(), NOW());

-- Annex A Batches table
CREATE TABLE annex_a_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL COMMENT 'UUID for batch identification',
    hei_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to heis table',
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex A Programs table
CREATE TABLE annex_a_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to annex_a_batches.batch_id',
    title VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NULL,
    implementation_date DATE NULL,
    target_group VARCHAR(255) NULL,
    participants_online INT NULL DEFAULT 0,
    participants_face_to_face INT NULL DEFAULT 0,
    organizer VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex B Tables
CREATE TABLE annex_b_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_b_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NULL,
    implementation_date DATE NULL,
    target_group TEXT NULL,
    participants_online INT UNSIGNED DEFAULT 0,
    participants_face_to_face INT UNSIGNED DEFAULT 0,
    organizer VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_b_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex C Tables
CREATE TABLE annex_c_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_c_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NULL,
    implementation_date DATE NULL,
    participants_online INT UNSIGNED DEFAULT 0,
    participants_face_to_face INT UNSIGNED DEFAULT 0,
    organizer VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_c_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data for Annex A
INSERT INTO annex_a_batches (batch_id, hei_id, academic_year, status, request_notes, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 1, '2024-2025', 'published', NULL, NOW(), NOW()),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 2, '2024-2025', 'submitted', NULL, NOW(), NOW());

INSERT INTO annex_a_programs (batch_id, title, venue, implementation_date, target_group, participants_online, participants_face_to_face, organizer, remarks, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Gender Sensitivity Training', 'UP Diliman Conference Hall', '2024-09-15', 'Faculty and Staff', 50, 100, 'HR Department', 'Successfully completed', NOW(), NOW()),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Anti-Sexual Harassment Workshop', 'Online Platform', '2024-10-20', 'All Students', 200, 0, 'Student Affairs Office', 'High attendance rate', NOW(), NOW()),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Safe Spaces Awareness Program', 'DLSU Main Auditorium', '2024-11-05', 'New Students', 30, 150, 'Guidance Office', 'Pending approval', NOW(), NOW());

-- Sample Data for Annex B
INSERT INTO annex_b_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 1, '2024-2025', 'published', NOW(), NOW()),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 3, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_b_programs (batch_id, title, venue, implementation_date, target_group, participants_online, participants_face_to_face, organizer, remarks, created_at, updated_at) VALUES
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Student Leadership Summit', 'UP Diliman AS Lobby', '2024-08-25', 'Student Leaders', 0, 250, 'Office of Student Activities', 'Annual event', NOW(), NOW()),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Community Outreach Program', 'Quezon City Communities', '2024-09-10', 'Volunteers', 0, 80, 'Community Extension Office', 'Successful outreach', NOW(), NOW()),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Environmental Advocacy Campaign', 'ADMU Campus', '2024-10-15', 'All Students', 100, 200, 'Environmental Committee', 'Ongoing initiative', NOW(), NOW());

-- Sample Data for Annex C
INSERT INTO annex_c_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 2, '2024-2025', 'published', NOW(), NOW());

INSERT INTO annex_c_programs (batch_id, title, venue, implementation_date, participants_online, participants_face_to_face, organizer, remarks, created_at, updated_at) VALUES
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Mental Health Awareness Week', 'DLSU Henry Sy Hall', '2024-10-01', 50, 150, 'Counseling Center', 'Well-received program', NOW(), NOW()),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Peer Counseling Training', 'Online and On-site', '2024-11-10', 40, 60, 'Psychology Department', 'Certified participants', NOW(), NOW());

-- Annex D Table (Student Handbook)
CREATE TABLE annex_d_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    version_publication_date VARCHAR(255) NULL,
    officer_in_charge VARCHAR(255) NULL,
    handbook_committee TEXT NULL,
    dissemination_orientation BOOLEAN DEFAULT FALSE,
    orientation_dates VARCHAR(255) NULL,
    mode_of_delivery VARCHAR(255) NULL,
    dissemination_uploaded BOOLEAN DEFAULT FALSE,
    dissemination_others BOOLEAN DEFAULT FALSE,
    dissemination_others_text VARCHAR(255) NULL,
    type_digital BOOLEAN DEFAULT FALSE,
    type_printed BOOLEAN DEFAULT FALSE,
    type_others BOOLEAN DEFAULT FALSE,
    type_others_text VARCHAR(255) NULL,
    has_academic_policies BOOLEAN DEFAULT FALSE,
    has_admission_requirements BOOLEAN DEFAULT FALSE,
    has_code_of_conduct BOOLEAN DEFAULT FALSE,
    has_scholarships BOOLEAN DEFAULT FALSE,
    has_student_publication BOOLEAN DEFAULT FALSE,
    has_housing_services BOOLEAN DEFAULT FALSE,
    has_disability_services BOOLEAN DEFAULT FALSE,
    has_student_council BOOLEAN DEFAULT FALSE,
    has_refund_policies BOOLEAN DEFAULT FALSE,
    has_drug_education BOOLEAN DEFAULT FALSE,
    has_foreign_students BOOLEAN DEFAULT FALSE,
    has_disaster_management BOOLEAN DEFAULT FALSE,
    has_safe_spaces BOOLEAN DEFAULT FALSE,
    has_anti_hazing BOOLEAN DEFAULT FALSE,
    has_anti_bullying BOOLEAN DEFAULT FALSE,
    has_violence_against_women BOOLEAN DEFAULT FALSE,
    has_gender_fair BOOLEAN DEFAULT FALSE,
    has_others BOOLEAN DEFAULT FALSE,
    has_others_text VARCHAR(255) NULL,
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex E Table (Student Organization)
CREATE TABLE annex_e_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_e_organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    name_of_accredited VARCHAR(255) NOT NULL,
    years_of_existence INT UNSIGNED DEFAULT 0,
    accredited_since VARCHAR(255) NOT NULL,
    faculty_adviser VARCHAR(255) NULL,
    president_and_officers TEXT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    fee_collected VARCHAR(255) NULL,
    programs_projects_activities TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_e_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex F Tables (Student Support Services)
CREATE TABLE annex_f_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    procedure_mechanism VARCHAR(255) NULL,
    complaint_desk VARCHAR(255) NULL,
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_f_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    date DATE NULL,
    status VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_f_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex G Table (Student Publications)
CREATE TABLE annex_g_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    official_school_name VARCHAR(255) NULL,
    student_publication_name VARCHAR(255) NULL,
    publication_fee_per_student DECIMAL(10, 2) NULL,
    frequency_monthly BOOLEAN DEFAULT FALSE,
    frequency_quarterly BOOLEAN DEFAULT FALSE,
    frequency_annual BOOLEAN DEFAULT FALSE,
    frequency_per_semester BOOLEAN DEFAULT FALSE,
    frequency_others BOOLEAN DEFAULT FALSE,
    frequency_others_specify VARCHAR(255) NULL,
    publication_type_newsletter BOOLEAN DEFAULT FALSE,
    publication_type_gazette BOOLEAN DEFAULT FALSE,
    publication_type_magazine BOOLEAN DEFAULT FALSE,
    publication_type_others BOOLEAN DEFAULT FALSE,
    publication_type_others_specify VARCHAR(255) NULL,
    adviser_name VARCHAR(255) NULL,
    adviser_position_designation VARCHAR(255) NULL,
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_g_editorial_boards (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    position_in_editorial_board VARCHAR(255) NULL,
    degree_program_year_level VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (submission_id) REFERENCES annex_g_submissions(submission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_g_other_publications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    name_of_publication VARCHAR(255) NOT NULL,
    department_unit_in_charge VARCHAR(255) NULL,
    type_of_publication VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (submission_id) REFERENCES annex_g_submissions(submission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_g_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    title_of_program VARCHAR(255) NOT NULL,
    implementation_date DATE NULL,
    implementation_venue VARCHAR(255) NULL,
    target_group_of_participants VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_submission_id (submission_id),
    FOREIGN KEY (submission_id) REFERENCES annex_g_submissions(submission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data for Annex D
INSERT INTO annex_d_submissions (submission_id, hei_id, academic_year, status, version_publication_date, officer_in_charge, type_digital, type_printed, has_academic_policies, has_code_of_conduct, has_safe_spaces, created_at, updated_at) VALUES
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 1, '2024-2025', 'published', '2024-06-01', 'Dean of Student Affairs', TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 2, '2024-2025', 'submitted', '2024-07-15', 'Student Services Director', TRUE, FALSE, TRUE, TRUE, TRUE, NOW(), NOW());

-- Sample Data for Annex E
INSERT INTO annex_e_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 1, '2024-2025', 'published', NOW(), NOW()),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 3, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_e_organizations (batch_id, name_of_accredited, years_of_existence, accredited_since, faculty_adviser, president_and_officers, specialization, fee_collected, programs_projects_activities, created_at, updated_at) VALUES
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'UP Computer Science Society', 5, '2019', 'Prof. Juan Dela Cruz', 'President: Maria Santos, VP: John Doe', 'Academic', '500.00', 'Programming workshops, hackathons, tech talks', NOW(), NOW()),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'UP Environmental Science Organization', 8, '2016', 'Prof. Ana Reyes', 'President: Jose Garcia, VP: Jane Smith', 'Advocacy', NULL, 'Tree planting, clean-up drives, environmental seminars', NOW(), NOW()),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'ADMU Debate Society', 10, '2014', 'Prof. Pedro Martinez', 'President: Sofia Cruz, VP: Miguel Torres', 'Co-curricular', '300.00', 'Debate tournaments, public speaking workshops', NOW(), NOW());

-- Sample Data for Annex F
INSERT INTO annex_f_batches (batch_id, hei_id, academic_year, status, procedure_mechanism, complaint_desk, created_at, updated_at) VALUES
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 2, '2024-2025', 'published', 'Online grievance system', 'Student Affairs Office', NOW(), NOW());

INSERT INTO annex_f_activities (batch_id, activity, date, status, created_at, updated_at) VALUES
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'Anti-Violence Against Women Seminar', '2024-09-01', 'Completed', NOW(), NOW()),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'Safe Spaces Training', '2024-10-15', 'Completed', NOW(), NOW());

-- Sample Data for Annex G
INSERT INTO annex_g_submissions (submission_id, hei_id, academic_year, status, official_school_name, student_publication_name, publication_fee_per_student, frequency_monthly, adviser_name, created_at, updated_at) VALUES
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 1, '2024-2025', 'published', 'University of the Philippines Diliman', 'Philippine Collegian', 50.00, TRUE, 'Prof. Maria Reyes', NOW(), NOW());

INSERT INTO annex_g_editorial_boards (submission_id, name, position_in_editorial_board, degree_program_year_level, created_at, updated_at) VALUES
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'Juan Dela Cruz', 'Editor-in-Chief', 'BA Journalism, 4th Year', NOW(), NOW()),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'Maria Santos', 'Managing Editor', 'BA Communication, 3rd Year', NOW(), NOW());

-- Annex H Table (Admission Services)
CREATE TABLE annex_h_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_h_admission_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    `with` BOOLEAN DEFAULT FALSE,
    supporting_documents TEXT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_h_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_h_admission_statistics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    program VARCHAR(255) NOT NULL,
    applicants INT DEFAULT 0,
    admitted INT DEFAULT 0,
    enrolled INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_h_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex I Tables
CREATE TABLE annex_i_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_i_scholarships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    scholarship_name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    category_intended_beneficiaries VARCHAR(255) NOT NULL,
    number_of_beneficiaries INT NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_i_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex J Tables
CREATE TABLE annex_j_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_j_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    title_of_program VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    participants_online INT NULL DEFAULT 0,
    participants_face_to_face INT NULL DEFAULT 0,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_j_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex K Tables
CREATE TABLE annex_k_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_k_committees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    committee_name VARCHAR(255) NOT NULL,
    committee_head_name VARCHAR(255) NOT NULL,
    members_composition TEXT NOT NULL,
    programs_projects_activities_trainings TEXT NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_k_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex L Tables
CREATE TABLE annex_l_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_l_housings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    housing_name VARCHAR(255) NOT NULL,
    complete_address VARCHAR(255) NOT NULL,
    house_manager_name VARCHAR(255) NOT NULL,
    male TINYINT(1) NOT NULL DEFAULT 0,
    female TINYINT(1) NOT NULL DEFAULT 0,
    coed TINYINT(1) NOT NULL DEFAULT 0,
    others VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_l_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex M Tables
CREATE TABLE annex_m_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_m_statistics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NULL,
    year_data JSON NULL,
    is_subtotal BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_m_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_m_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    section VARCHAR(255) NOT NULL,
    category VARCHAR(255) NULL,
    institutional_services_programs_activities TEXT NOT NULL,
    number_of_beneficiaries_participants INT DEFAULT 0,
    remarks TEXT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_m_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_n_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_n_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    title_of_activity VARCHAR(255) NOT NULL,
    implementation_date DATE NOT NULL,
    implementation_venue VARCHAR(255) NOT NULL,
    participants_online INT NULL DEFAULT 0,
    participants_face_to_face INT NULL DEFAULT 0,
    organizer VARCHAR(255) NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_n_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annex O Tables
CREATE TABLE annex_o_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    hei_id BIGINT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    request_notes TEXT NULL,
    cancelled_notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_hei_id (hei_id),
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (hei_id) REFERENCES heis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annex_o_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL,
    title_of_program VARCHAR(255) NOT NULL,
    date_conducted DATE NOT NULL,
    number_of_beneficiaries INT NOT NULL,
    type_of_community_service VARCHAR(255) NOT NULL,
    community_population_served VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_batch_id (batch_id),
    FOREIGN KEY (batch_id) REFERENCES annex_o_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data for Annex H
INSERT INTO annex_h_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 1, '2024-2025', 'published', NOW(), NOW());

INSERT INTO annex_h_admission_services (batch_id, service_type, `with`, supporting_documents, created_at, updated_at) VALUES
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'General admission guidelines', TRUE, 'Admission Manual 2024', NOW(), NOW()),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'Online enrolment and payment system', TRUE, 'CRS System Documentation', NOW(), NOW());

-- Sample Data for Other Annexes
INSERT INTO annex_i_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 2, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_j_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 3, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_k_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 1, '2024-2025', 'published', NOW(), NOW());

INSERT INTO annex_l_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9fa0', 2, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_m_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 1, '2024-2025', 'published', NOW(), NOW());

INSERT INTO annex_m_statistics (batch_id, category, subcategory, year_data, display_order, created_at, updated_at) VALUES
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Undergraduate', 'Male', '{"2024-2025":{"enrollment":5000,"graduates":1200},"2023-2024":{"enrollment":4800,"graduates":1150},"2022-2023":{"enrollment":4600,"graduates":1100}}', 1, NOW(), NOW()),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Undergraduate', 'Female', '{"2024-2025":{"enrollment":5500,"graduates":1300},"2023-2024":{"enrollment":5300,"graduates":1250},"2022-2023":{"enrollment":5100,"graduates":1200}}', 2, NOW(), NOW()),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Graduate', 'Male', '{"2024-2025":{"enrollment":800,"graduates":200},"2023-2024":{"enrollment":750,"graduates":180},"2022-2023":{"enrollment":700,"graduates":170}}', 3, NOW(), NOW()),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Graduate', 'Female', '{"2024-2025":{"enrollment":900,"graduates":220},"2023-2024":{"enrollment":850,"graduates":200},"2022-2023":{"enrollment":800,"graduates":190}}', 4, NOW(), NOW());

INSERT INTO annex_m_services (batch_id, section, category, institutional_services_programs_activities, number_of_beneficiaries_participants, remarks, display_order, created_at, updated_at) VALUES
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Academic Support', 'Tutoring', 'Free tutoring services for all students', 1500, 'Ongoing program', 1, NOW(), NOW()),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9fa0b1', 'Health Services', 'Medical', 'Free medical consultation and check-ups', 3000, 'Available daily', 2, NOW(), NOW());

INSERT INTO annex_n_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('f8a9b0c1-d2e3-4f4a-5b6c-7d8e9fa0b1c2', 3, '2024-2025', 'submitted', NOW(), NOW());

INSERT INTO annex_o_batches (batch_id, hei_id, academic_year, status, created_at, updated_at) VALUES
('a9b0c1d2-e3f4-4a5b-6c7d-8e9fa0b1c2d3', 2, '2024-2025', 'published', NOW(), NOW());

-- Setup Complete
-- Database includes:
-- - 3 sample HEIs (UP, DLSU, ADMU)
-- - 1 SuperAdmin and 3 HEI admin users (password: password)
-- - All Annex tables (A through O) with sample data
-- - Sample annual submissions for academic year 2024-2025
--
-- Database Schema Updates (2026-01-14):
-- - Annex D: Added missing checklist columns (has_student_publication, has_housing_services,
--   has_disability_services, has_student_council, has_refund_policies, has_drug_education,
--   has_foreign_students, has_disaster_management, has_anti_hazing, has_anti_bullying,
--   has_violence_against_women, has_gender_fair, has_others, has_others_text)
-- - Annex E: Updated table structure to match requirements (name_of_accredited, years_of_existence,
--   accredited_since, faculty_adviser, president_and_officers, specialization, fee_collected,
--   programs_projects_activities)
-- - Annex L: Changed type columns from separate booleans (male, female, coed, others) to single
--   dropdown field (type) with optional others_text for better UX
