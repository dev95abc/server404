import { getDb } from '../db';

export const fetchAllMajors = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM majors ORDER BY id');
};

export const fetchMajorByUniversityId = async (id: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM majors WHERE university_id = $1', id);
};

export const insertMajor = async (name: string, universityId: number) => {
  const db = await getDb();
  return db.get(
    'INSERT INTO majors (name, university_id) VALUES ($1, $2) RETURNING *',
    name,
    universityId
  );
};

export const updateMajorById = async (id: number, name: string) => {
  const db = await getDb();
  return db.get(
    'UPDATE majors SET name = $1 WHERE id = $2 RETURNING *',
    name,
    id
  );
};

export const deleteMajorById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM majors WHERE id = $1', id);
};
