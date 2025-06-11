import { getDb } from '../db';

export const fetchAllCourses = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM course ORDER BY id');

};

export const fetchCourseById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM courses WHERE id = $1', [id]);
};
export const fetchAllCoursesByMajorId = async (id: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM courses WHERE id = $1', [id]);
};

export const insertCourse = async (name: string, semesterId: number) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO course (name, semester_id) VALUES ($1, $2)  RETURNING *',
    name,
    semesterId
  );
  return result.rows[0] ;
};

export const updateCourseById = async (id: number, name: string, semesterId: number) => {
  const db = await getDb();
  await db.run(
    'UPDATE course SET name = $1, semester_id = $2 WHERE id = $3',
    name,
    semesterId,
    id
  );
  return db.get('SELECT * FROM course WHERE id = $1', id);
};

export const deleteCourseById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM course WHERE id = $1', id);
};

export async function recordCourseVisitAndTrim(user_id: number, course_id: number ): Promise<void> {
  const db = await getDb();
  console.log('recordCourseVisitAndTrim called with user_id:', user_id, 'course_id:', course_id);

  // Insert or update the course visit
  await db.run(`
    INSERT INTO course_visits_New (user_id, course_id, visited_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, course_id)
    DO UPDATE SET visited_at = CURRENT_TIMESTAMP
  `, [user_id, course_id]);

  // Trim to keep only the 3 most recent course visits
  await db.run(`
    DELETE FROM course_visits_New
    WHERE id NOT IN (
      SELECT id FROM course_visits_New
      WHERE user_id = $1
      ORDER BY visited_at DESC
      LIMIT 3
    )
    AND user_id = $2
  `, [user_id, user_id]);
}


export async function getVisitedCourses(user_id: number): Promise<
  { course_id: number, course_code: string, course_title: string, visited_at: string }[]
> {
  const db = await getDb();
  const rows = await db.all(`
    SELECT cv.course_id, c.course_code, c.course_title, cv.visited_at
    FROM course_visits_New cv
    JOIN courses c ON cv.course_id = c.id
    WHERE cv.user_id = $1
    ORDER BY cv.visited_at DESC
  `, [user_id]);

  return rows;
}


interface CoursePayload {
  id?: number;
  semester_id: number;
  course_code: string;
  course_title: string;
  credits: number;
  major_id: number | null;
  modules: Array<{
    id?: number;
    course_id?: number;
    name: string;
    module_number: number;
    unit_number: number;
    topics: Array<{
      id?: number;
      chapter_id?: number;
      title: string;
    }>;
  }>;
}

export const insertCourseHierarchy = async (payload: Omit<CoursePayload, 'id'>): Promise<CoursePayload> => {
  const db = await getDb();

  try {
    await db.run('BEGIN TRANSACTION');

    // 1. Insert the course
    const courseResult = await db.run(
      `INSERT INTO courses (semester_id, course_code, course_title, credits, major_id)
         VALUES (?, ?, ?, ?, ?)  RETURNING *`,
      [payload.semester_id, payload.course_code, payload.course_title, payload.credits, payload.major_id]
    );
    const courseId = courseResult.rows[0].id;

    // 2. Insert all chapters/modules
    const insertedModules = await Promise.all(
      payload.modules.map(async (module) => {
        const moduleResult = await db.run(
          `INSERT INTO chapters (course_id, name, module_number, unit_number)
             VALUES (?, ?, ?, ?)  RETURNING *`,
          [courseId, module.name, module.module_number, module.unit_number]
        );
        const chapterId = moduleResult.rows[0].id;

        // 3. Insert all topics for this chapter
        const insertedTopics = await Promise.all(
          module.topics.map(async (topic) => {
            const topicResult = await db.run(
              `INSERT INTO topics (chapter_id, title)
                 VALUES (?, ?) RETURNING *`,
              [chapterId, topic.title]
            );
            return {
              ...topic,
              id: topicResult.rows[0].id,
              chapter_id: chapterId
            };
          })
        );

        return {
          ...module,
          id: chapterId,
          course_id: courseId,
          topics: insertedTopics
        };
      })
    );

    await db.run('COMMIT');

    return {
      ...payload,
      id: courseId,
      modules: insertedModules
    };

  } catch (error) {
    console.log(error, 'error in qureis')
    await db.run('ROLLBACK');
    console.error('Error inserting course hierarchy:', error);
    throw error;
  }
}




export const AllDetailsByCourseId = async (id: number) => {
  const db = await getDb();
  console.log('running....', id)
  return await db.get(`
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

