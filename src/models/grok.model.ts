// src/models/majorModel.ts
import { getDb } from '../db';
import Groq from 'groq-sdk';

const groq = new Groq({
  //add keys here
  apiKey: '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'
});

type ParsedSyllabus = {
  id: number;
  semester_id: number;
  course_code: string;
  course_title: string;
  credits: number;
  modules: Array<{
    id?: number;
    course_id?: number;
    name: string;
    module_number: number;
    unit_number: number;
    topics: Array<{
      id?: number;
      chapter_id: number;
      title: string;
    }>;
  }>;
};

export const parseSyllabus = async (
  rawSyllabusText: string
): Promise<ParsedSyllabus | null> => {
  const prompt = `
You are an expert syllabus parser.

Given the following raw syllabus text, extract and organize it into JSON with this structure:

{
  "id": 1,
  "semester_id": 1,
  "course_code": "CS101",
  "course_title": "Introduction to Computer Science",
  "credits": 4,
  "modules": [
    {
      "id": 1,
      "course_id": 1,
      "name": "Introduction to Programming",
      "module_number": 1,
      "unit_number": 1,
      "topics": [
        {
          "id": 1,
          "chapter_id": 1,
          "title": "What is Programming?"
        },
        {
          "id": 2,
          "chapter_id": 1,
          "title": "History of Programming Languages"
        }
      ]
    }
  ]
}

Rules:
1. Number all IDs sequentially starting from 1
2. Set course_id to always match the syllabus id (1 in this example)
3. For the course_code, extract it from the text or use a placeholder like "SIM101"
4. For the course_title, extract it from the text or use a descriptive title
5. Set credits to a reasonable value (typically 3-4)
6. Create modules based on the units in the syllabus
7. Break down each unit's content into topics
8. The module_number should increment sequentially
9. The unit_number should reset for each new module

Raw syllabus text:
"""
${rawSyllabusText}
"""`;

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that expertly parses syllabus text into structured JSON according to the specified format.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5, // Lower temperature for more structured output
    response_format: { type: "json_object" }, // Request JSON output
  });

  const responseText = completion.choices?.[0]?.message?.content ?? '';

  try {
    // Parse the JSON response
    const parsed: ParsedSyllabus = JSON.parse(responseText);
    
    // Validate basic structure
    if (!parsed.modules || !Array.isArray(parsed.modules)) {
      throw new Error("Invalid module structure");
    }
    
    // Ensure all IDs are properly set
    let topicIdCounter = 1;
    parsed.modules.forEach(module => {
      module.course_id = parsed.id;
      module.topics.forEach(topic => {
        topic.id = topicIdCounter++;
      });
    });
    
    return parsed;
  } catch (err) {
    console.error('Failed to parse syllabus JSON:', err);
    return null;
  }
};
// export const  bulkSaveCourseHierarchy = async (courseData: any) => {
//   const db = await getDb();
  
//   try {
//     await db.run('BEGIN TRANSACTION');

//     // 1. Save course
//     const courseResult = await db.run(
//       `INSERT OR IGNORE INTO courses (semester_id, course_code, course_title, credits) 
//        VALUES (?, ?, ?, ?)`,
//       [courseData.semester_id, courseData.course_code, courseData.course_title, courseData.credits]
//     );
//     const courseId =  courseResult.lastID;

//     // 2. Prepare all chapters and topics
//     const chapterValues = [];
//     const topicValues = [];
    
//     for (const module of courseData.modules) {
//       for (const unit of module.units) {
//         for (const chapter of unit.chapters) {
//           chapterValues.push([courseId, chapter.name, module.module_number, unit.unit_number]);
//         }
//       }
//     }

//     // 3. Bulk insert chapters
//     const chapterStmt = await db.prepare(
//       `INSERT INTO chapters (course_id, name, module_number, unit_number) 
//        VALUES (?, ?, ?, ?)`
//     );
    
//     for (const values of chapterValues) {
//       await chapterStmt.run(values);
//     }
//     await chapterStmt.finalize();

//     // 4. Get all chapters to map topics
//     const chapters = await db.all(
//       `SELECT id, name FROM chapters WHERE course_id = ?`,
//       [courseId]
//     );

//     // 5. Prepare topics
//     for (const module of courseData.modules) {
//       for (const unit of module.units) {
//         for (const chapter of unit.chapters) {
//           const dbChapter = chapters.find(c => c.name === chapter.name);
//           if (dbChapter) {
//             for (const topic of chapter.topics) {
//               topicValues.push([dbChapter.id, topic.title]);
//             }
//           }
//         }
//       }
//     }

//     // 6. Bulk insert topics
//     const topicStmt = await db.prepare(
//       `INSERT INTO topics (chapter_id, title) VALUES (?, ?)`
//     );
    
//     for (const values of topicValues) {
//       await topicStmt.run(values);
//     }
//     await topicStmt.finalize();

//     await db.run('COMMIT');
//     return { success: true, courseId };
//   } catch (error) {
//     await db.run('ROLLBACK');
//     console.error('Error in bulk save:', error);
//     throw error;
//   }
// }

export const fetchAllMajors = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM major ORDER BY id');
};
