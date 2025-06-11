import { getDb } from "../db";

export const fetchAllUniversities = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM universities ORDER BY id');
};

export const fetchUniversityById = async (id: number) => {
    const db = await getDb();
    return db.get('SELECT * FROM universities WHERE id = $1', id);
};

export const insertUniversity = async (name: string) => {
    const db = await getDb();
    const result = await db.run('INSERT INTO universities (name) VALUES ($1)  RETURNING *', name);
    return  result.rows[0];
};

export const updateUniversityById = async (id: number, name: string) => {
    const db = await getDb();
    await db.run('UPDATE universities SET name = $1 WHERE id = $2', name, id);
    return db.get('SELECT * FROM universities WHERE id = $1', id);
};

export const deleteUniversityById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM universities WHERE id = $1', id);
};