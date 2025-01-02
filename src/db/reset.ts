import dotenv from 'dotenv';
import pool from '../config/database';
import { runMigrations } from './index';

dotenv.config();

const dropTables = async (pool: any) => {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS project_submissions CASCADE;
      DROP TABLE IF EXISTS resources CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS cohorts CASCADE;
    `);
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

(async () => {
  try {
    await dropTables(pool);
    await runMigrations(pool);
    console.log('Database reset and migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
})();