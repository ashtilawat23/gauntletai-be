import dotenv from 'dotenv';
import pool from '../config/database';
import { runMigrations } from './index';

// Load test environment variables
dotenv.config({ path: '.env.test' });

(async () => {
  try {
    await runMigrations(pool);
    console.log('Test database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test database migration failed:', error);
    process.exit(1);
  }
})();