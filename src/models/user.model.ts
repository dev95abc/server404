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