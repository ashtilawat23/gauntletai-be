import { Pool } from 'pg';
import { ProjectSubmission, CreateProjectSubmissionDTO } from '../types/project';
import logger from '../utils/logger';

export class ProjectService {
  constructor(private db: Pool) {}

  async createSubmission(studentId: number, submission: CreateProjectSubmissionDTO): Promise<ProjectSubmission> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if deadline has passed
      const currentWeek = 1; // TODO: Calculate current week based on cohort start date
      if (submission.week_number < currentWeek - 1 || submission.week_number > currentWeek) {
        throw new Error('Submission window for this week is closed');
      }

      // Check if student already has a submission for this week
      const existingSubmission = await client.query(
        'SELECT id FROM project_submissions WHERE student_id = $1 AND week_number = $2',
        [studentId, submission.week_number]
      );

      if (existingSubmission.rows.length > 0) {
        // If exists, create new submission
        const result = await client.query(
          `INSERT INTO project_submissions 
           (student_id, week_number, video_url, github_url, social_url, document_url)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            studentId,
            submission.week_number,
            submission.video_url,
            submission.github_url,
            submission.social_url,
            submission.document_url
          ]
        );

        await client.query('COMMIT');
        return result.rows[0];
      }

      const result = await client.query(
        `INSERT INTO project_submissions 
         (student_id, week_number, video_url, github_url, social_url, document_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          studentId,
          submission.week_number,
          submission.video_url,
          submission.github_url,
          submission.social_url,
          submission.document_url
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create project submission:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getSubmissionsByStudent(studentId: number): Promise<ProjectSubmission[]> {
    try {
      const result = await this.db.query(
        'SELECT * FROM project_submissions WHERE student_id = $1 ORDER BY week_number',
        [studentId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get student submissions:', error);
      throw error;
    }
  }

  async getSubmissionsByWeek(weekNumber: number): Promise<ProjectSubmission[]> {
    try {
      const result = await this.db.query(
        'SELECT * FROM project_submissions WHERE week_number = $1',
        [weekNumber]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get week submissions:', error);
      throw error;
    }
  }
}