import { Pool } from 'pg';
import { ProjectService } from '../../services/projectService';
import { CreateProjectSubmissionDTO } from '../../types/project';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('ProjectService', () => {
  let pool: Pool;
  let projectService: ProjectService;

  beforeAll(async () => {
    pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      database: process.env.POSTGRES_DB
    });
    projectService = new ProjectService(pool);
  });

  beforeEach(async () => {
    await pool.query('BEGIN');
    // Clear database in correct order (respect foreign key constraints)
    await pool.query('DELETE FROM project_submissions');
    await pool.query('DELETE FROM resources');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM cohorts');

    // Insert test cohort
    await pool.query(`
      INSERT INTO cohorts (id, name, start_date, end_date)
      VALUES (1, 'Test Cohort', '2025-01-01', '2025-03-31')
    `);

    // Insert test user
    await pool.query(`
      INSERT INTO users (id, clerk_id, email, name, role, cohort_id)
      VALUES (1, 'test_clerk_id', 'test@example.com', 'Test Student', 'student', 1)
    `);
  });

  afterEach(async () => {
    await pool.query('ROLLBACK');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createSubmission', () => {
    const validSubmission: CreateProjectSubmissionDTO = {
      week_number: 1,
      video_url: 'https://loom.com/test',
      github_url: 'https://github.com/test/repo',
      social_url: 'https://twitter.com/test/status/123',
      document_url: 'https://docs.google.com/test'
    };

    it('should create a new submission successfully', async () => {
      const result = await projectService.createSubmission(1, validSubmission);
      
      expect(result).toHaveProperty('id');
      expect(result.student_id).toBe(1);
      expect(result.week_number).toBe(1);
      expect(result.video_url).toBe(validSubmission.video_url);
    });

    it('should reject submission for invalid week number', async () => {
      const invalidSubmission = { ...validSubmission, week_number: 20 };
      
      await expect(projectService.createSubmission(1, invalidSubmission))
        .rejects
        .toThrow('Submission window for this week is closed');
    });

    it('should allow submission for current week', async () => {
      const currentWeekSubmission = { ...validSubmission, week_number: 1 };
      
      const result = await projectService.createSubmission(1, currentWeekSubmission);
      expect(result.week_number).toBe(1);
    });
  });

  describe('getSubmissionsByStudent', () => {
    beforeEach(async () => {
      // Insert test submissions
      await pool.query(`
        INSERT INTO project_submissions 
        (student_id, week_number, video_url, github_url, social_url, document_url)
        VALUES 
        (1, 1, 'video1', 'github1', 'social1', 'doc1'),
        (1, 2, 'video2', 'github2', 'social2', 'doc2')
      `);
    });

    it('should return all submissions for a student', async () => {
      const submissions = await projectService.getSubmissionsByStudent(1);
      
      expect(submissions).toHaveLength(2);
      expect(submissions[0].week_number).toBe(1);
      expect(submissions[1].week_number).toBe(2);
    });

    it('should return empty array for student with no submissions', async () => {
      const submissions = await projectService.getSubmissionsByStudent(999);
      expect(submissions).toHaveLength(0);
    });
  });

  describe('getSubmissionsByWeek', () => {
    beforeEach(async () => {
      // Insert test submissions for different students
      await pool.query(`
        INSERT INTO users (id, clerk_id, email, name, role, cohort_id)
        VALUES (2, 'clerk_2', 'test2@example.com', 'Test Student 2', 'student', 1)
      `);

      await pool.query(`
        INSERT INTO project_submissions 
        (student_id, week_number, video_url, github_url, social_url, document_url)
        VALUES 
        (1, 1, 'video1', 'github1', 'social1', 'doc1'),
        (2, 1, 'video2', 'github2', 'social2', 'doc2')
      `);
    });

    it('should return all submissions for a week', async () => {
      const submissions = await projectService.getSubmissionsByWeek(1);
      
      expect(submissions).toHaveLength(2);
      expect(submissions[0].week_number).toBe(1);
      expect(submissions[1].week_number).toBe(1);
    });
  });
});