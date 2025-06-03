// src/models/majorModel.ts
import { getDb } from '../db';

export const fetchAllMajors = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM major ORDER BY id');
};

export const fetchMajorByUniversityId = async (id: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM majors WHERE university_id = ?', id);
};

export const insertMajor = async (name: string, universityId: number) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO majors (name, university_id) VALUES (?, ?)',
    name,
    universityId
  );
  return db.get('SELECT * FROM majors WHERE id = ?', result.lastID);
};

export const updateMajorById = async (id: number, name: string) => {
  const db = await getDb();
  await db.run('UPDATE major SET name = ? WHERE id = ?', name, id);
  return db.get('SELECT * FROM major WHERE id = ?', id);
};

export const deleteMajorById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM major WHERE id = ?', id);
};
