-- Seed cohort
INSERT INTO cohorts (name, start_date, end_date) VALUES
('Winter 2025', '2025-01-01', '2025-03-31');

-- Seed users (1 admin, 3 students)
INSERT INTO users (clerk_id, email, name, role, cohort_id) VALUES
('admin_clerk_123', 'admin@gauntlet.ai', 'Admin User', 'admin', NULL),
('student_clerk_1', 'student1@gmail.com', 'John Doe', 'student', 1),
('student_clerk_2', 'student2@gmail.com', 'Jane Smith', 'student', 1),
('student_clerk_3', 'student3@gmail.com', 'Bob Wilson', 'student', 1);

-- Seed resources
INSERT INTO resources (title, url, type, week_number, cohort_id, created_by) VALUES
('Week 1 Recording', 'https://zoom.us/rec/123', 'recording', 1, 1, 1),
('Course GitHub', 'https://github.com/gauntlet-ai/course', 'github', NULL, 1, 1),
('Week 1 Slides', 'https://slides.com/w1', 'slides', 1, 1, 1);

-- Seed project submissions
INSERT INTO project_submissions (student_id, week_number, video_url, github_url, social_url, document_url, social_engagement) VALUES
(2, 1, 'https://loom.com/123', 'https://github.com/johndoe/w1', 'https://twitter.com/john/status/123', 'https://docs.google.com/123', 50),
(3, 1, 'https://loom.com/456', 'https://github.com/jane/w1', 'https://twitter.com/jane/status/456', 'https://docs.google.com/456', 75);