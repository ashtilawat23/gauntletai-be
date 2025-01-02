-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cohorts table first (referenced by users)
CREATE TABLE cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'admin')),
    cohort_id INTEGER REFERENCES cohorts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_submissions table
CREATE TABLE project_submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
    video_url VARCHAR(255) NOT NULL,
    github_url VARCHAR(255) NOT NULL,
    social_url VARCHAR(255) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    social_engagement INTEGER DEFAULT 0,
    is_passed BOOLEAN DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP,
    graded_by INTEGER REFERENCES users(id)
);

-- Create resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('recording', 'github', 'slides', 'document')),
    week_number INTEGER CHECK (week_number BETWEEN 1 AND 12),
    cohort_id INTEGER REFERENCES cohorts(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);