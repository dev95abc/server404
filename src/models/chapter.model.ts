import { getDb } from '../db';

import sql from '../db';


export const fetchAllChapters = async () => {
    try {
        // console.log(sql)
        const result = await sql`SELECT * FROM my_table`;
        return result; // Note: return result.rows, not the whole result
        //i do not get result and i do not get error as well
    } catch (error) {
        console.error('Database error:', error);
        //  i do not get error as well
        throw error; // Re-throw to be caught by the route handler
    } 
};

 // Test the connection
async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('Database connection successful:', result);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}

export const fetchChapterById = async (id: number) => {
    const db = await getDb();
    return db.all('SELECT * FROM chapters WHERE course_id = $1', [id]);
};

export const insertChapter = async (
    name: string,
    courseId: number,
    moduleNumber: number,
    unitNumber: number
) => {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO chapter (name, course_id, module_number, unit_number) VALUES ($1, $2, $3, $4) RETURNING *',
        name,
        courseId,
        moduleNumber,
        unitNumber
    );
    return   result.rows[0] 
    // error:Property 'lastID' does not exist on type 'QueryResult<any>'
};

export const updateChapterById = async (
    id: number,
    name: string,
    moduleNumber: number,
    unitNumber: number
) => {
    const db = await getDb();
    await db.run(
        'UPDATE chapter SET name = $1, module_number = $2, unit_number = $3 WHERE id = $4',
        name,
        moduleNumber,
        unitNumber,
        id
    );
    return db.get('SELECT * FROM chapter WHERE id = $1', id);
};

export const deleteChapterById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM chapter WHERE id = $1', id);
};