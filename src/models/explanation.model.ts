import { getDb } from '../db';

export const fetchAllExplanations = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM explanation ORDER BY id');
};

export const fetchExplanationById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM explanations WHERE topic_id = ?', [id]);
};

export const fetchExplanationsByTopicId = async (topicId: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM explanation WHERE topic_id = ? ORDER BY id', topicId);
};

export const insertExplanation = async (topicId: number, content: string) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO explanation (topic_id, content) VALUES (?, ?)',
    topicId,
    content
  );
  return db.get('SELECT * FROM explanation WHERE id = ?', result.lastID);
};

export const updateExplanationById = async (id: number, content: string) => {
  const db = await getDb();
  await db.run('UPDATE explanation SET content = ? WHERE id = ?', content, id);
  return db.get('SELECT * FROM explanation WHERE id = ?', id);
};

export const deleteExplanationById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM explanation WHERE id = ?', id);
};
