import { getDb } from "../db";  
  
export async function findUserByAuth0Id(auth0Id: string) {
const db = await getDb();
return db.get('SELECT * FROM users WHERE auth0_id = ?', [auth0Id]);
}

export async function createUser(auth0Id: string, email: string, name: string) {
const db = await getDb();
const result = await db.run(
'INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)',
[auth0Id, email, name]
);
return db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
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
      `UPDATE explanations SET likes = likes + 1 WHERE id = ?`,
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