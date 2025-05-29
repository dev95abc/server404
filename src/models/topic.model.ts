import { getDb } from '../db';

export const fetchAllTopics = async () => {
const db = await getDb();
return db.all('SELECT * FROM topic ORDER BY id');
};

export const fetchTopicById = async (id: number) => {
const db = await getDb();
return db.all('SELECT * FROM topics WHERE chapter_id = ?', [id]);
};

export const insertTopic = async (name: string, chapterId: number) => {
const db = await getDb();
const result = await db.run(
'INSERT INTO topic (name, chapter_id) VALUES (?, ?)',
name,
chapterId
);
return db.get('SELECT * FROM topic WHERE id = ?', result.lastID);
};

export const updateTopicById = async (id: number, name: string) => {
const db = await getDb();
await db.run('UPDATE topic SET name = ? WHERE id = ?', name, id);
return db.get('SELECT * FROM topic WHERE id = ?', id);
};

export const deleteTopicById = async (id: number) => {
const db = await getDb();
await db.run('DELETE FROM topic WHERE id = ?', id);
};