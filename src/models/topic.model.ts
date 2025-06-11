import { getDb } from '../db';

export const fetchAllTopics = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM topic ORDER BY id');
};

export const fetchTopicById = async (id: number) => {
    const db = await getDb();
    return db.all('SELECT * FROM topics WHERE chapter_id =  $1', [id]);
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
            learned_topics lt ON t.id = lt.topic_id AND lt.user_id = $1
        WHERE 
            t.chapter_id = $2
        ORDER BY 
            t.id
    `, [userId, chapterId]);
};


export const insertTopic = async (name: string, chapterId: number) => {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO topic (name, chapter_id) VALUES ( $1,  $2)  RETURNING *',
        name,
        chapterId
    );
    return result.rows[0];
};

export const updateTopicById = async (id: number, name: string) => {
    const db = await getDb();
    await db.run('UPDATE topic SET name =  $1 WHERE id =  $2', name, id);
    return db.get('SELECT * FROM topic WHERE id =  $1', id);
};

export const deleteTopicById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM topic WHERE id =  $1', id);
};