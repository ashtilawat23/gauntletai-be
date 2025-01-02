import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: 'student' | 'admin';
      cohortId?: number;
    }
  }
}

// For now, just checking if user exists in our database
export const addUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from header set by frontend
    const clerkId = req.headers['x-user-id'];

    if (!clerkId) {
      return res.status(401).json({ error: 'No user ID provided' });
    }

    const result = await pool.query(
      `SELECT id, role, cohort_id 
       FROM users 
       WHERE clerk_id = $1`,
      [clerkId]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = result.rows[0].id;
    req.userRole = result.rows[0].role;
    req.cohortId = result.rows[0].cohort_id;

    next();
  } catch (error) {
    logger.error('Error in auth middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};