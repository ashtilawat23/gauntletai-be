import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const runMigrations = async (pool: Pool) => {
    try {
      const migrationPath = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationPath).sort();
      
      for (const file of files) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationPath, file), 'utf8');
        await pool.query(sql);
      }
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  };

const runSeeds = async (pool: Pool) => {
  try {
    const seedPath = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedPath).sort();
    
    for (const file of files) {
      console.log(`Running seed: ${file}`);
      const sql = fs.readFileSync(path.join(seedPath, file), 'utf8');
      await pool.query(sql);
    }
    console.log('Seeds completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

export { runMigrations, runSeeds };