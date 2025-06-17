import { getDb } from '../db';



export const fetchAllChapters = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM users ORDER BY id');
};

export const fetchChapterById = async (id: number) => {
    const db = await getDb();
    return db.all('SELECT * FROM chapters WHERE course_id = ?', [id]);
};

export const insertChapter = async (
    name: string,
    courseId: number,
    moduleNumber: number,
    unitNumber: number
) => {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO chapter (name, course_id, module_number, unit_number) VALUES (?, ?, ?, ?)',
        name,
        courseId,
        moduleNumber,
        unitNumber
    );
    return db.get('SELECT * FROM chapter WHERE id = ?', result.lastID);
};

export const updateChapterById = async (
    id: number,
    name: string,
    moduleNumber: number,
    unitNumber: number
) => {
    const db = await getDb();
    await db.run(
        'UPDATE chapter SET name = ?, module_number = ?, unit_number = ? WHERE id = ?',
        name,
        moduleNumber,
        unitNumber,
        id
    );
    return db.get('SELECT * FROM chapter WHERE id = ?', id);
};

export const deleteChapterById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM chapter WHERE id = ?', id);
};