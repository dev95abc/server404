import { getDb } from '../db';

export const fetchAllCourses = async () => {
    const db = await getDb();
    return db.all('SELECT * FROM course ORDER BY id');
};

export const fetchCourseById = async (id: number) => {
    const db = await getDb();
    return db.get('SELECT * FROM courses WHERE id = ?', [id]);
};

export const insertCourse = async (name: string, semesterId: number) => {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO course (name, semester_id) VALUES (?, ?)',
        name,
        semesterId
    );
    return db.get('SELECT * FROM course WHERE id = ?', result.lastID);
};

export const updateCourseById = async (id: number, name: string, semesterId: number) => {
    const db = await getDb();
    await db.run(
        'UPDATE course SET name = ?, semester_id = ? WHERE id = ?',
        name,
        semesterId,
        id
    );
    return db.get('SELECT * FROM course WHERE id = ?', id);
};

export const deleteCourseById = async (id: number) => {
    const db = await getDb();
    await db.run('DELETE FROM course WHERE id = ?', id);
};

export const AllDetailsByCourseId = async (id: number) => {
    const db = await getDb();
    console.log('running....', id)
  return   await db.get(`
SELECT 
    u.name AS university_name,
    m.name AS major_name,
    s.name AS semester_name,
    co.course_code,
    co.course_title,
    ch.id AS chapter_id,
    ch.name AS chapter_name,
    ch.module_number,
    ch.unit_number,
    t.id AS topic_id,
    t.title AS topic_title,
    e.id AS explanation_id,
    e.text AS explanation_text,
    e.prompt AS explanation_prompt,
    usr.username AS explanation_author,
    e.created_at AS explanation_date,
    COUNT(l.id) AS like_count
FROM 
    universities u
JOIN 
    majors m ON u.id = m.university_id
JOIN 
    semesters s ON m.id = s.major_id
JOIN 
    courses co ON s.id = co.semester_id
JOIN 
    chapters ch ON co.id = ?
LEFT JOIN 
    topics t ON ch.id = t.chapter_id
LEFT JOIN 
    explanations e ON t.id = e.topic_id
LEFT JOIN 
    users usr ON e.created_by = usr.id
LEFT JOIN 
    likes l ON e.id = l.explanation_id
GROUP BY 
    u.name, m.name, s.name, co.course_code, co.course_title,
    ch.id, ch.name, ch.module_number, ch.unit_number,
    t.id, t.title,
    e.id, e.text, e.prompt, usr.username, e.created_at
ORDER BY 
    u.name, m.name, s.name, co.course_code, 
    ch.module_number, ch.unit_number, ch.name, t.title;
    `,
        [id],
        (err: any, rows: any) => {
            if (err) {
                console.log('Error executing query:', err);
                return;
            }
            console.log('Results:', rows);
        }
    );
}