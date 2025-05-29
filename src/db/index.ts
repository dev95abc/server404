import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let dbInstance: Database | null = null;

export const getDb = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: './syllabus22.db',
    driver: sqlite3.Database,
  });

  console.log("Initializing database and tables...");
 

  return dbInstance;
};
