import express from 'express';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Gauntlet AI API',
    version: '1.0.0',
    status: 'online'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test data endpoint to view seeded data
app.get('/test-data', async (req, res) => {
  try {
    const cohorts = await pool.query('SELECT * FROM cohorts');
    const users = await pool.query('SELECT * FROM users');
    const resources = await pool.query('SELECT * FROM resources');
    const submissions = await pool.query('SELECT * FROM project_submissions');

    res.json({
      cohorts: cohorts.rows,
      users: users.rows,
      resources: resources.rows,
      submissions: submissions.rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch test data',
      error: (error as Error).message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});