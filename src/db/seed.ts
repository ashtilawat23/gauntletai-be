import pool from '../config/database';
import { runSeeds } from './index';

(async () => {
  try {
    await runSeeds(pool);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();