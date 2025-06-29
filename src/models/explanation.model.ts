import axios from 'axios';
import { getDb } from '../db';
import Groq from 'groq-sdk';

const groq = new Groq({
  //add keys here
  apiKey: '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'
});


export const fetchAllExplanations = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM explanation ORDER BY id');
};

export const fetchExplanationById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM explanations WHERE topic_id = $1', [id]);
};

export const fetchLikedUserIdsByExplanationId = async (explanationId: number): Promise<number[]> => {
  const db = await getDb();
  console.log('fetchLikedUserIdsByExplanationId called with explanationId:', explanationId);
  const rows = await db.all(
    'SELECT user_id FROM likes WHERE explanation_id = $1',
    [explanationId]
  );
  console.log('rows', rows)
  return rows.map(row => row.user_id);
};

export const fetchLearnedUserIdsByExplanationId = async (explanationId: number): Promise<number[]> => {
  const db = await getDb();
  console.log('fetchLearnedUserIdsByExplanationId called with topic id:', explanationId);
  const rows = await db.all(
    'SELECT user_id FROM learned_topics WHERE topic_id = $1',
    [explanationId]
  );
  console.log('rows', rows)
  return rows.map(row => row.user_id);
};


//write a functin that return the liked user ids for a given explanation id form the likes table
// export const fetchLikedUserIdsByExplanationId  
// CREATE TABLE likes (
//   id INTEGER PRIMARY KEY,
//   explanation_id INTEGER NOT NULL,
//   user_id INTEGER NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (explanation_id) REFERENCES explanations (id) ON DELETE CASCADE,
//   FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
//   UNIQUE (explanation_id, user_id)
// )

export const fetchExplanationsByTopicId = async (topicId: number) => {

  const db = await getDb();
  return db.all('SELECT * FROM explanations WHERE topic_id = $1 ORDER BY id', topicId);
};

export const insertExplanation = async (topicId: number, prompt: string, content: string, likes: Number) => {
  console.log('creating explsnation')
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO explanations (topic_id, prompt, text, likes_count) VALUES ($1, $2,$3,$4) RETURNING *', 
    topicId,
    prompt,
    content,
    likes
  );
  return result.rows[0];
};

export const updateExplanationById = async (id: number, content: string) => {
  const db = await getDb();
  await db.run('UPDATE explanation SET content = $1 WHERE id = $2', content, id);
  return db.get('SELECT * FROM explanation WHERE id = $1', id);
};

export const deleteExplanationById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM explanation WHERE id = $1', id);
};


interface Explanation {
  id: number;
  text: string;
  prompt: string;
  likes: number;
}


export const generateExplanation1 = async (topicId: Number, chpId: Number, topicTitle: string) => {
  // const prompt = `This is my syllabus, ${contextSyllbus}, just to give you context. now, Explain the topic "${topicTitle}" in simple terms for a beginner.`;
  const prompt = `This is my syllabus,  just to give you context. now, Explain the topic "${topicTitle}" in simple terms for a beginner.`;

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that explains academic concepts clearly and concisely. your response directly answers the question without any additional text or explanation.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const explanationText: string =
    completion.choices?.[0]?.message?.content ?? '';

  const explanation: Explanation = {
    id: Number(topicId),
    text: explanationText,
    prompt,
    likes: 0,
  };
  return explanation

};


export const generateExplanation = async (topicId: Number, chpId: Number, topicTitle: string, contextString: string) => {
  const prompt = `I'm a beginner learning about ${topicTitle} as part of my studies. Here's context about my syllabus: ${contextString}.

Please explain "${topicTitle}" to me in simple terms with these guidelines:
1. Start directly with the explanation 20-30 words of introduction
2. Use everyday examples and analogies
3. Mention the other topics in the syllabus that relate to this topic
4. Break down complex ideas into small steps
5. Avoid jargon or explain terms simply when needed
6. Keep it under 350 words`;
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent$1key=AIzaSyB6FTfeIq4MsPfl2wJO0x9XWl2fr3aovyE`;

    const response = await axios.post(apiUrl, {
      contents: [{
        parts: [
          {
            text: JSON.stringify([
              {
                role: "user",
                parts: [{ text: "You are a helpful assistant that explains academic concepts clearly and concisely. your response directly answers the question without any additional text." }]
              },
              {
                role: "model",
                parts: [{ text: "Understood. I will explain concepts clearly and simply." }]
              },
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ])
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7, // Matching the original temperature
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const explanationText = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('Explanation generated:', explanationText);
    const explanation: Explanation = {
      id: Number(topicId),
      text: explanationText,
      prompt,
      likes: 0,
    };
    return explanation;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return empty explanation if API call fails
    return {
      id: Number(topicId),
      text: '',
      prompt,
      likes: 0,
    };
  }
};



type ParsedSyllabus = {
  modules: Array<{
    module_number: number;
    units: Array<{
      unit_number: number;
      chapters: Array<{
        id: number;
        name: string;
        module_number: number;
        unit_number: number;
        topics: Array<{
          id: number;
          title: string;
        }>;
      }>;
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
  "modules": [
    {
      "module_number": <number>,
      "units": [
        {
          "unit_number": <number>,
          "chapters": [
            {
              "id": <unique id>,
              "name": "<chapter name>",
              "module_number": <module number>,
              "unit_number": <unit number>,
              "topics": [
                {
                  "id": <unique id>,
                  "title": "<topic title>"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Number the modules, units, chapters, and topics sequentially and uniquely. Use the text to fill the fields appropriately.

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
          'You are a helpful assistant that expertly parses syllabus text into structured JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const responseText = completion.choices?.[0]?.message?.content ?? '';

  // Try to parse the JSON from the response
  try {
    // Sometimes model outputs explanation or text around JSON, so try to extract JSON by finding {...}
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      const parsed: ParsedSyllabus = JSON.parse(jsonString);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse syllabus JSON:', err);
  }

  // Return null if parsing fails
  return null;
};
