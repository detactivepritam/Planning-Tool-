import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Roni%40157890@localhost:5432/proxie_planning_db';

const pool = new Pool({ connectionString });

async function run() {
  const schemaPath = path.resolve(__dirname, '../src/lib/server/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Connecting to PostgreSQL 18 database...');
  const client = await pool.connect();
  try {
    console.log('Applying database schema...');
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✅ PostgreSQL 18 schema migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
