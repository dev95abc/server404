import { getDb } from '../db';

export const fetchAllSemesters = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM semester ORDER BY id');
};

export const fetchSemesterById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM semester WHERE id = $1', id);
};

export const insertSemester = async (major_id: number, name: string) => {
  const db = await getDb();
  return db.get(
    'INSERT INTO semester (major_id, name) VALUES ($1, $2) RETURNING *',
    major_id,
    name
  );
};

export const updateSemesterById = async (id: number, major_id: number, name: string) => {
  const db = await getDb();
  return db.get(
    'UPDATE semester SET major_id = $1, name = $2 WHERE id = $3 RETURNING *',
    major_id,
    name,
    id
  );
};

export const deleteSemesterById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM semester WHERE id = $1', id);
};
