import express, { Request, Response } from 'express';
import { ProjectService } from '../../services/projectService';
import pool from '../../config/database';
import logger from '../../utils/logger';

const router = express.Router();
const projectService = new ProjectService(pool);

// Submit a project
router.post('/', async (req: Request, res: Response) => {
  try {
    // TODO: Get student_id from auth token
    const studentId = 1; // Temporary hardcoded value
    const submission = await projectService.createSubmission(studentId, req.body);
    
    logger.info('Project submission created', {
      studentId,
      weekNumber: req.body.week_number
    });

    res.status(201).json(submission);
  } catch (error) {
    logger.error('Failed to create submission', {
      error: (error as Error).message,
      studentId: 1,
      weekNumber: req.body.week_number
    });

    res.status(400).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get student's submissions
router.get('/my-submissions', async (req: Request, res: Response) => {
  try {
    // TODO: Get student_id from auth token
    const studentId = 1; // Temporary hardcoded value
    const submissions = await projectService.getSubmissionsByStudent(studentId);
    res.json(submissions);
  } catch (error) {
    logger.error('Failed to get student submissions', {
      error: (error as Error).message,
      studentId: 1
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch submissions'
    });
  }
});

// Get all submissions for a week (admin only)
router.get('/week/:weekNumber', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authorization check
    const weekNumber = parseInt(req.params.weekNumber);
    const submissions = await projectService.getSubmissionsByWeek(weekNumber);
    res.json(submissions);
  } catch (error) {
    logger.error('Failed to get week submissions', {
      error: (error as Error).message,
      weekNumber: req.params.weekNumber
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch submissions'
    });
  }
});

export default router;