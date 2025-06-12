import { Pool } from 'pg';
 // db.js
import postgres from 'postgres'

const sql = postgres(
  process.env.DATABASE_URL || 'postgresql://sylabd_studyingby:509a112c27c3363532ffe0ded635aae133557fe8@8hunz.h.filess.io:5432/sylabd_studyingby',
  {
    ssl: true, // Try this simpler approach first
    connect_timeout: 10,
    idle_timeout: 30,
    max: 10,
    onnotice: notice => console.log('Postgres Notice:', notice)
  }
);

 

// Try a simple query to verify connection
 
export default sql


const pool = new Pool({
  user: 'postgres',
  host: 'db.uqyuhmovgfpklefywmpv.supabase.co',
  database: 'postgres',
  password: 'Sagar.K989Kas',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});

const db = {
  run: async (query: string, ...params: any) => {
    try {
      return await pool.query(query, params);
    } catch (err) {
      console.error('DB RUN ERROR:', err);
      throw err;
    }
  },
  get: async (query: string, ...params: any) => {
    try {
      const result = await pool.query(query, params);
      return result.rows[0] || null;
    } catch (err) {
      console.error('DB GET ERROR:', err);
      throw err;
    }
  },
  all: async (query: string, ...params: any) => {
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (err) {
      console.error('DB ALL ERROR:', err);
      throw err;
    }
  },
};

export const getDb = async () => {
  return db;
};

 
 

 