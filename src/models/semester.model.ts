// src/models/semester.model.ts
import { getDb } from '../db';

export const fetchAllSemesters = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM semester ORDER BY id');
};

export const fetchSemesterById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM semester WHERE id =  $1', id);
};

export const insertSemester = async (major_id: number, name: string) => {
  const db = await getDb();
  const result = await db.run('INSERT INTO semester (major_id, name) VALUES ( $1,  $2)  RETURNING *', major_id, name);
  return   result.rows[0];
};

export const updateSemesterById = async (id: number, major_id : number, name: string) => {
  const db = await getDb();
  await db.run('UPDATE semester SET name =  $1 WHERE id =  $2', name, id);
  return db.get('SELECT * FROM semester WHERE id =  $1', id);
};

export const deleteSemesterById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM semester WHERE id =  $1', id);
};
