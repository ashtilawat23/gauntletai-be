import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import pool from './config/database';
import logger from './utils/logger';
import projectRoutes from './routes/project/projectRoutes';
import resourceRoutes from './routes/resource/resourceRoutes';
import webhookRoutes from './routes/webhook/clerkWebhook';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Custom morgan token for response time
morgan.token('response-time', (req: Request & { _startAt?: [number, number] }, res: Response & { _startAt?: [number, number] }) => {
  if (!req._startAt || !res._startAt) {
    // Missing request/response start time
    return '';
  }
  // Calculate time in milliseconds
  const ms = (res._startAt[0] - req._startAt[0]) * 1000 + (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3);
});

// More detailed morgan logging format
app.use(morgan(':method :url :status :response-time ms - :res[content-length] bytes'));

app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/webhook', webhookRoutes);

// Health check endpoint with enhanced logging
app.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  logger.info('Health check initiated', {
    endpoint: '/health',
    method: 'GET',
    requestId: req.headers['x-request-id'] || Date.now()
  });

  try {
    const result = await pool.query('SELECT NOW()');
    const responseTime = Date.now() - startTime;

    logger.info('Health check completed', {
      responseTime,
      dbTimestamp: result.rows[0].now
    });

    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      responseTime: `${responseTime}ms`,
      message: 'Database connection successful',
      service: 'Gauntlet AI API'
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      timeTaken: Date.now() - startTime
    });

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: (error as Error).message
    });
  }
});

// Test data endpoint with more detailed logging
app.get('/test-data', async (req: Request, res: Response) => {
  const startTime = Date.now();
  logger.info('Fetching test data - Request started', {
    endpoint: '/test-data',
    method: 'GET',
    requestId: req.headers['x-request-id'] || Date.now()
  });

  try {
    const cohorts = await pool.query('SELECT * FROM cohorts');
    logger.debug('Fetched cohorts data', { count: cohorts.rowCount });

    const users = await pool.query('SELECT * FROM users');
    logger.debug('Fetched users data', { count: users.rowCount });

    const resources = await pool.query('SELECT * FROM resources');
    logger.debug('Fetched resources data', { count: resources.rowCount });

    const submissions = await pool.query('SELECT * FROM project_submissions');
    logger.debug('Fetched submissions data', { count: submissions.rowCount });

    const responseTime = Date.now() - startTime;
    logger.info('Test data fetch completed', {
      responseTime,
      totalRecords: {
        cohorts: cohorts.rowCount,
        users: users.rowCount,
        resources: resources.rowCount,
        submissions: submissions.rowCount
      }
    });

    res.json({
      cohorts: cohorts.rows,
      users: users.rows,
      resources: resources.rows,
      submissions: submissions.rows
    });
  } catch (error) {
    logger.error('Failed to fetch test data', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      timeTaken: Date.now() - startTime
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch test data',
      error: (error as Error).message
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Gauntlet AI API, running on port ' + port);
  res.status(200);
});

app.listen(port, () => {
  logger.info('Server started', {
    port,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});