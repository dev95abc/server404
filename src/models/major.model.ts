// src/models/majorModel.ts
import { getDb } from '../db';

export const fetchAllMajors = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM major ORDER BY id');
};

export const fetchMajorByUniversityId = async (id: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM majors WHERE university_id = $1', id);
};

export const insertMajor = async (name: string, universityId: number) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO majors (name, university_id) VALUES ($1, $2)  RETURNING *',
    name,
    universityId
  );
  return result.rows[0];
};

export const updateMajorById = async (id: number, name: string) => {
  const db = await getDb();
  await db.run('UPDATE major SET name = $1 WHERE id = $2', name, id);
  return db.get('SELECT * FROM major WHERE id = $1', id);
};

export const deleteMajorById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM major WHERE id = $1', id);
};
