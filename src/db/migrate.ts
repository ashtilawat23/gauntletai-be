import pool from '../config/database';
import { runMigrations } from './index';

(async () => {
  try {
    await runMigrations(pool);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();