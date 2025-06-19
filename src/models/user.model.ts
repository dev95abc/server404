import { getDb } from "../db";

export async function findUserByAuth0Id(auth0Id: string) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE auth0_id = $1', auth0Id);
}

export async function findUserById(userId: number) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE id = $1', userId);
}

export async function createUser(auth0Id: string, email: string, name: string) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO users (auth0_id, email, name) VALUES ($1, $2, $3)',
    auth0Id,
    email,
    name
  );
  return db.get('SELECT * FROM users WHERE id = $1', result.lastID);
}

export async function insertLearnedTopic(topic_id: number, user_id: number, chapter_id: number,course_id:number): Promise<any> {
  const db = await getDb();
  try {
    const added = await db.run(
      'INSERT INTO learned_topics (topic_id, user_id, chapter_id, course_id) VALUES ($1, $2, $3,$4)',
      topic_id,
      user_id,
      chapter_id,
      course_id
    );
    return added;
  } catch (err: any) {
    if (err.code === '23505') {
      // PostgreSQL unique violation
      return false;
    }
    throw err;
  }
}

export async function removeLearnedTopicByUser(topic_id: number, user_id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(
    'DELETE FROM learned_topics WHERE topic_id = $1 AND user_id = $2',
    topic_id,
    user_id
  );
  return result.rows.length > 0;
}

export async function getLearnedTopicsByUser(user_id: number): Promise<{ topic_id: number, chapter_id: number,  course_id: number }[]> {
  const db = await getDb();
  const rows = await db.all(
    'SELECT topic_id, chapter_id, course_id FROM learned_topics WHERE user_id = $1 ORDER BY marked_at DESC',
    user_id
  );
  return rows;
}

//  Error in likeExplanation: error: insert or update on table "likes" violates foreign key constraint "likes_explanation_id_fkey"
export async function insertLikeAndIncrementExplanation(
  explanation_id: number,
  user_id: number
): Promise<boolean> {
  const db = await getDb();
  const client = db.client;
  console.log(explanation_id, user_id, 'explanation_id, user_id')
  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO likes (explanation_id, user_id) VALUES ($1, $2)',
      [explanation_id, user_id]
    );

    await client.query(
      'UPDATE explanations SET likes_count = likes_count + 1 WHERE id = $1',
      [explanation_id]
    );

    await client.query('COMMIT');
    return true;
  } catch (err: any) {
    await client.query('ROLLBACK');

    // Handle unique constraint violation (e.g., already liked)
    if (err.code === '23505') {
      return false;
    }

    throw err;
  }
}


export async function removeLikeAndDecrementExplanation(explanation_id: number, user_id: number): Promise<boolean> {
  const db = await getDb();

  try {
    await db.run('BEGIN');

    const result = await db.run(
      'DELETE FROM likes WHERE explanation_id = $1 AND user_id = $2 RETURNING *',
      explanation_id,
      user_id
    );

    if (result.rows.length === 0) {
      await db.run('ROLLBACK');
      return false; // No like existed to remove
    }

    await db.run(
      'UPDATE explanations SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
      explanation_id
    );

    await db.run('COMMIT');
    return true;
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}
