import { Pool } from 'pg';
 // db.js
import postgres from 'postgres'

const sql = postgres(
  process.env.DATABASE_URL || 'postgresql://postgres:sagar__kasyap@db.bgsyqzuhgfnlszvnqite.supabase.co:5432/postgres',
  {
    // Correct options (notice is valid, onerror is not)
    onnotice: notice => console.log('Postgres Notice:', notice),
    
    // Recommended additional options for Supabase
    ssl: { 
      require: true,
      rejectUnauthorized: false // For development only, remove in production
    },
    connect_timeout: 10, // Timeout after 10 seconds
    idle_timeout: 30,    // Close idle connections after 30 seconds
    max: 10             // Max number of connections
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

 
 

 