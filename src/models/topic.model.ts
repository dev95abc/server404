import { getDb } from '../db';

export const fetchAllTopics = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM topic ORDER BY id');
};

export const fetchTopicById = async (id: number) => {
    const db = await getDb();
    return db.all('SELECT * FROM topics WHERE chapter_id = ?', [id]);
};

 
export const fetchTopicWithLearnedStatus = async (userId: number, chapterId: number) => {
    const db = await getDb();
    return db.all(`
        SELECT 
            t.*,
            CASE WHEN lt.topic_id IS NOT NULL THEN 1 ELSE 0 END AS learned
        FROM 
            topics t
        LEFT JOIN 
            learned_topics lt ON t.id = lt.topic_id AND lt.user_id = ?
        WHERE 
            t.chapter_id = ?
        ORDER BY 
            t.id
    `, [userId, chapterId]);
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