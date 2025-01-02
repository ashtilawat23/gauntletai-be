import { Pool } from 'pg';
import { ProjectSubmission, CreateProjectSubmissionDTO } from '../types/project';
import { DateHelper } from '../utils/dateHelpers';
import logger from '../utils/logger';

export class ProjectService {
  constructor(private db: Pool) {}

  async getCohortStartDate(studentId: number): Promise<Date> {
    const result = await this.db.query(`
      SELECT c.start_date 
      FROM cohorts c
      JOIN users u ON u.cohort_id = c.id
      WHERE u.id = $1
    `, [studentId]);

    if (!result.rows[0]) {
      throw new Error('Student not found or not assigned to a cohort');
    }

    return new Date(result.rows[0].start_date);
  }

  async createSubmission(studentId: number, submission: CreateProjectSubmissionDTO): Promise<ProjectSubmission> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get cohort start date
      const cohortStartDate = await this.getCohortStartDate(studentId);
      const currentDate = new Date();

      // Check if submission is within valid window
      if (!DateHelper.isValidSubmissionWindow(submission.week_number, cohortStartDate, currentDate)) {
        throw new Error('Submission window for this week is closed. You can only submit for the current week or previous week.');
      }

      // Create submission
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

      logger.info('Project submission created', {
        studentId,
        weekNumber: submission.week_number,
        isLateSubmission: DateHelper.getWeekNumber(cohortStartDate, currentDate) > submission.week_number
      });

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
        `SELECT 
          ps.*,
          u.name as grader_name
         FROM project_submissions ps
         LEFT JOIN users u ON ps.graded_by = u.id
         WHERE ps.student_id = $1 
         ORDER BY ps.week_number`,
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
        `SELECT 
          ps.*,
          s.name as student_name,
          g.name as grader_name
         FROM project_submissions ps
         JOIN users s ON ps.student_id = s.id
         LEFT JOIN users g ON ps.graded_by = g.id
         WHERE ps.week_number = $1
         ORDER BY ps.submitted_at`,
        [weekNumber]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get week submissions:', error);
      throw error;
    }
  }

  async gradeSubmission(submissionId: number, adminId: number, isPassed: boolean): Promise<ProjectSubmission> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Check if submission exists
      const submissionCheck = await client.query(
        'SELECT id FROM project_submissions WHERE id = $1',
        [submissionId]
      );

      if (submissionCheck.rows.length === 0) {
        throw new Error('Submission not found');
      }

      // Update the submission with grade
      const result = await client.query(
        `UPDATE project_submissions 
         SET is_passed = $1, 
             graded_by = $2,
             graded_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [isPassed, adminId, submissionId]
      );

      await client.query('COMMIT');

      logger.info('Project submission graded', {
        submissionId,
        adminId,
        isPassed
      });

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to grade submission:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateSocialEngagement(submissionId: number, engagement: number): Promise<ProjectSubmission> {
    try {
      const result = await this.db.query(
        `UPDATE project_submissions 
         SET social_engagement = $1
         WHERE id = $2
         RETURNING *`,
        [engagement, submissionId]
      );

      if (result.rows.length === 0) {
        throw new Error('Submission not found');
      }

      logger.info('Social engagement updated', {
        submissionId,
        engagement
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update social engagement:', error);
      throw error;
    }
  }

  async getStudentProgress(studentId: number): Promise<any> {
    try {
      const result = await this.db.query(
        `SELECT 
          week_number,
          submitted_at,
          is_passed,
          CASE 
            WHEN submitted_at > cohort_week_end THEN 'late'
            ELSE 'on-time'
          END as submission_status
         FROM project_submissions ps
         JOIN users u ON ps.student_id = u.id
         JOIN cohorts c ON u.cohort_id = c.id
         WHERE student_id = $1
         ORDER BY week_number`,
        [studentId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get student progress:', error);
      throw error;
    }
  }
}