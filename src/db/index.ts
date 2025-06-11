// db.ts (PostgreSQL version)
import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

type QueryParams = any[];

// Mimic the sqlite3 interface
const db = {
  run: async (query: string, ...params: QueryParams) => {
    return pool.query(query, params);
  },
  get: async (query: string, ...params: QueryParams) => {
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },
  all: async (query: string, ...params: QueryParams) => {
    const result = await pool.query(query, params);
    return result.rows;
  },
};

export const getDb = async () => {
  return db;
};







// import sqlite3 from 'sqlite3'
// import { open, Database } from 'sqlite'

// let dbInstance: Database | null = null;

// export const getDb = async (): Promise<Database> => {
//   if (dbInstance) return dbInstance;

//   dbInstance = await open({
//     filename: './syllabus22.db',
//     driver: sqlite3.Database,
//   });

//   console.log("Initializing database and tables...");
 

//   return dbInstance;
// };
