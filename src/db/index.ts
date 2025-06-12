import { Pool } from 'pg';
 // db.js
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres('postgresql://postgres:Sagar.K989Kas@db.uqyuhmovgfpklefywmpv.supabase.co:5432/postgres')

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

 
 

 