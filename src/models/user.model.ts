import { getDb } from "../db";

// export async function findUserByAuth0Id(auth0Id: number) {
//     const db = await getDb();
//     return db.get('DELETE FROM users WHERE id = 2', [auth0Id]);
// }
export async function findUserByAuth0Id(auth0Id: string) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE auth0_id = ?', [auth0Id]);
}

export async function findUserById(userId: number) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE id = ?', [userId]);
}


export async function createUser(auth0Id: string, email: string, name: string) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)',
        [auth0Id, email, name]
    );
    return db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
}



export async function insertLearnedTopic(topic_id: number, user_id: number, chapter_id:number): Promise<any> {
    const db = await getDb();
    try {
//         CREATE TABLE learned_topics (
//   id INTEGER PRIMARY KEY,
//   topic_id INTEGER NOT NULL,
//   chapter_id INTEGER NOT NULL,
//   user_id INTEGER NOT NULL,
//   marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
//   FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE,
//   FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
//   UNIQUE (topic_id, user_id)
// )
        const added = await db.run(
            `INSERT INTO learned_topics (topic_id, user_id, chapter_id) VALUES (?, ?, ?)`,
            [topic_id, user_id, chapter_id]
        );
        return added;
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return false; // Already marked
        }
        throw err;
    }
}

export async function removeLearnedTopicByUser(topic_id: number, user_id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.run(
        `DELETE FROM learned_topics WHERE topic_id = ? AND user_id = ?`,
        [topic_id, user_id]
    );
    if (result.changes && result?.changes > 0) {
        return true
    } else {
        return false
    }
}

export async function getLearnedTopicsByUser(user_id: number): Promise<{ topic_id: number }[]> {
    const db = await getDb();

    const rows = await db.all<{ topic_id: number }[]>(`
    SELECT topic_id, chapter_id
    FROM learned_topics
    WHERE user_id = ?
    ORDER BY marked_at DESC
  `, [user_id]);

    return rows;
}


export async function insertLikeAndIncrementExplanation(explanation_id: number, user_id: number): Promise<boolean> {
    const db = await getDb();

    try {
        // Start transaction
        await db.run('BEGIN TRANSACTION');

        // Try inserting the like
        await db.run(
            `INSERT INTO likes (explanation_id, user_id) VALUES (?, ?)`,
            [explanation_id, user_id]
        );

        // Increment explanation like count
        await db.run(
            `UPDATE explanations SET likes_count = likes_count + 1 WHERE id = ?`,
            [explanation_id]
        );

        // Commit if all went well
        await db.run('COMMIT');
        return true;
    } catch (err: any) {
        // Rollback in case of error
        await db.run('ROLLBACK');

        if (err.code === 'SQLITE_CONSTRAINT') {
            return false; // User already liked
        }

        throw err;
    }
}

export async function removeLikeAndDecrementExplanation(explanation_id: number, user_id: number): Promise<boolean> {
    const db = await getDb();

    try {
        // Start transaction
        await db.run('BEGIN TRANSACTION');

        // Delete the like
        const result = await db.run(
            `DELETE FROM likes WHERE explanation_id = ? AND user_id = ?`,
            [explanation_id, user_id]
        );

        if (result.changes === 0) {
            await db.run('ROLLBACK');
            return false; // No like existed to remove
        }

        // Decrement the like count
        await db.run(
            `UPDATE explanations SET likes_count = likes_count - 1 WHERE id = ? AND likes_count > 0`,
            [explanation_id]
        );

        // Commit the transaction
        await db.run('COMMIT');
        return true;
    } catch (err) {
        await db.run('ROLLBACK');
        throw err;
    }
}
