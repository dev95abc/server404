import { getDb } from '../db';
import Groq from 'groq-sdk';

const groq = new Groq({  
  //add keys here
});


export const fetchAllExplanations = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM explanation ORDER BY id');
};

export const fetchExplanationById = async (id: number) => {
  const db = await getDb();
  return db.get('SELECT * FROM explanations WHERE topic_id = ?', [id]);
};

export const fetchExplanationsByTopicId = async (topicId: number) => {

  const db = await getDb();
  return db.all('SELECT * FROM explanations WHERE topic_id = ? ORDER BY id', topicId);
};

export const insertExplanation = async (topicId: number,prompt:string, content: string, likes: Number) => {
  console.log('creating explsnation')
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO explanations (topic_id, prompt, text, likes_count) VALUES (?, ?,?,?)',
    topicId,
    prompt,
    content,
    likes
  );
  return db.get('SELECT * FROM explanations WHERE id = ?', result.lastID);
};

export const updateExplanationById = async (id: number, content: string) => {
  const db = await getDb();
  await db.run('UPDATE explanation SET content = ? WHERE id = ?', content, id);
  return db.get('SELECT * FROM explanation WHERE id = ?', id);
};

export const deleteExplanationById = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM explanation WHERE id = ?', id);
};

 
interface Explanation {
  id: number;
  text: string;
  prompt: string;
  likes: number;
}


export const generateExplanation = async (topicId: Number,chpId:Number, topicTitle: string) => { 
  const prompt = `Explain the topic "${topicTitle}" in simple terms for a beginner.`;

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that explains academic concepts clearly and concisely.',
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