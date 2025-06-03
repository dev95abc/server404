import { getDb } from "../db";

export const fetchAllUniversities = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM universities ORDER BY id');
};

export const fetchUniversityById = async (id: number) => {
    const db = await getDb();
    return db.get('SELECT * FROM universities WHERE id = ?', id);
};

export const insertUniversity = async (name: string) => {
    const db = await getDb();
    const result = await db.run('INSERT INTO universities (name) VALUES (?)', name);
    return db.get('SELECT * FROM universities WHERE id = ?', result.lastID);
};

export const updateUniversityById = async (id: number, name: string) => {
    const db = await getDb();
    await db.run('UPDATE universities SET name = ? WHERE id = ?', name, id);
    return db.get('SELECT * FROM universities WHERE id = ?', id);
};

export const deleteUniversityById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM universities WHERE id = ?', id);
};