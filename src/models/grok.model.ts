// src/models/majorModel.ts
import axios from 'axios';
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
  major_id: number | null;
  modules: Array<{
    id: number;
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

  const cleanedText = rawSyllabusText.split('\n')
    .filter(line => !line.match(/^comece|wows|\|/)) // Remove garbage lines
    .join('\n')
    .trim();

 const prompt = `
You are an expert syllabus parser that strictly follows output formatting rules.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY the actual syllabus content, ignoring any irrelevant text
2. Split ALL topic lists into individual items (never combine multiple topics in one item)
3. Create separate modules for each Unit (Unit 1, Unit 2, etc.)
4. For content under "General Principles", create a separate module within the same Unit
5. Follow EXACTLY this JSON structure:
{
  "id": number,
  "semester_id": 1,
  "course_code": "SIM101",
  "course_title": "Introduction to Simulation and Statistical Models",
  "credits": 3,
  "major_id": null,
  "modules": [
    {
      "id": number,
      "course_id": same_as_parent_id,
      "name": "string",
      "module_number": sequential (1, 2, 3...),
      "unit_number": 1,
      "topics": [
        {
          "id": number,
          "chapter_id": same_as_module_id,
          "title": "string"
        }
      ]
    }
  ]
}

SPECIFIC RULES:
1. Unit 1 content should create two modules:
   - First module: "Introduction to Simulation and Statistical Models"
   - Second module: "General Principles" (from the General Principles section)
2. Unit 2 content should create one module
3. NEVER combine topics from different sections
4. Remove colons from topic titles (e.g., "Introduction to Simulation" not "Introduction to Simulation:")
5. Set course_code to "SIM101"
6. Set course_title to "Introduction to Simulation and Statistical Models"
7. Set credits to 3
8. Set major_id to null
9. All unit_number values should be 1
10. Topics should be split at commas and colons

Raw syllabus text:
"""
${cleanedText}
"""

ONLY RETURN THE JSON OUTPUT, NOTHING ELSE. DO NOT INCLUDE ANY EXPLANATIONS.`;


  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB6FTfeIq4MsPfl2wJO0x9XWl2fr3aovyE`;

    const response = await axios.post(apiUrl, {
      contents: [
        {
          parts: [
            {
              text: JSON.stringify([
                {
                  role: 'user',
                  parts: [{ text: 'You are a helpful assistant that expertly parses syllabus text into structured JSON according to the specified format.' }]
                },
                {
                  role: 'model',
                  parts: [{ text: 'Understood. I will parse syllabus text into the specified JSON format.' }]
                },
                {
                  role: 'user',
                  parts: [{ text: prompt }]
                }
              ])
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3, // Match Groq's temperature
        response_mime_type: "application/json" // Request JSON output
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    const test = JSON.parse(responseText);
    test.major_id = null
    console.log('Parsed JSON:', test);
    console.log('Response from Gemini API:', responseText);
    try {
      // Parse the JSON response
      const parsed: ParsedSyllabus = test[0];

      // Validate basic structure (same as Groq implementation)
      if (!parsed.modules || !Array.isArray(parsed.modules)) {
        throw new Error("Invalid module structure");
      }

      // Ensure all IDs are properly set (same as Groq implementation)
      let topicIdCounter = 1;
      parsed.modules.forEach(module => {
        module.course_id = parsed.id;
        module.unit_number = 1; // Force unit_number to 1
        module.topics.forEach(topic => {
          topic.id = topicIdCounter++;
          topic.chapter_id = module.id;
        });
      });

      return parsed;
    } catch (err) {
      console.error('Failed to parse syllabus JSON:', err);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};


export const parseSyllabus2 = async (
  rawSyllabusText: string
): Promise<ParsedSyllabus | null> => {
  // Enhanced input cleaning
  const cleanedText = rawSyllabusText
    .split('\n')
    .filter(line => !line.match(/^(comece|wows|\||MODULE -1)/i)) // Remove garbage lines and module headers
    .join('\n')
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  const prompt = `
You are an expert syllabus parser that strictly follows output formatting rules.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY the actual syllabus content, ignoring any irrelevant text
2. Split ALL topic lists into individual items (never combine multiple topics in one item)
3. Create separate modules for each Unit (Unit 1, Unit 2, etc.)
4. For content under "General Principles", create a separate module within the same Unit
5. Follow EXACTLY this JSON structure:
{
  "id": number,
  "semester_id": 1,
  "course_code": "SIM101",
  "course_title": "Introduction to Simulation and Statistical Models",
  "credits": 3,
  "major_id": null,
  "modules": [
    {
      "id": number,
      "course_id": same_as_parent_id,
      "name": "string",
      "module_number": sequential (1, 2, 3...),
      "unit_number": 1,
      "topics": [
        {
          "id": number,
          "chapter_id": same_as_module_id,
          "title": "string"
        }
      ]
    }
  ]
}

SPECIFIC RULES:
1. Unit 1 content should create two modules:
   - First module: "Introduction to Simulation and Statistical Models"
   - Second module: "General Principles" (from the General Principles section)
2. Unit 2 content should create one module
3. NEVER combine topics from different sections
4. Remove colons from topic titles (e.g., "Introduction to Simulation" not "Introduction to Simulation:")
5. Set course_code to "SIM101"
6. Set course_title to "Introduction to Simulation and Statistical Models"
7. Set credits to 3
8. Set major_id to null
9. All unit_number values should be 1
10. Topics should be split at commas and colons

Raw syllabus text:
"""
${cleanedText}
"""

ONLY RETURN THE JSON OUTPUT, NOTHING ELSE. DO NOT INCLUDE ANY EXPLANATIONS.`;

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB6FTfeIq4MsPfl2wJO0x9XWl2fr3aovyE`;

   const response = await axios.post(apiUrl, {
      contents: [
        {
          parts: [
            {
              text: JSON.stringify([
                {
                  role: 'user',
                  parts: [{ text: 'You are a helpful assistant that expertly parses syllabus text into structured JSON according to the specified format.' }]
                },
                {
                  role: 'model',
                  parts: [{ text: 'Understood. I will parse syllabus text into the specified JSON format.' }]
                },
                {
                  role: 'user',
                  parts: [{ text: prompt }]
                }
              ])
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3, // Match Groq's temperature
        response_mime_type: "application/json" // Request JSON output
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseText = response.data.candidates[0].content.parts[0].text;
    
    try {
      const parsed: ParsedSyllabus = JSON.parse(responseText);
      
      // Post-processing to ensure exact format
      let topicIdCounter = 1;
      let moduleIdCounter = 1;
      
      parsed.modules.forEach(module => {
        module.id = moduleIdCounter++;
        module.course_id = parsed.id;
        module.unit_number = 1;
        
        module.topics.forEach(topic => {
          topic.id = topicIdCounter++;
          topic.chapter_id = module.id;
          // Clean topic titles
          topic.title = topic.title
            .replace(/:/g, '') // Remove colons
            .trim();
        });
      });
      
      // Force specific fields
      parsed.course_code = "SIM101";
      parsed.course_title = "Introduction to Simulation and Statistical Models";
      parsed.credits = 3;
      parsed.major_id = null;
      parsed.semester_id = 1;
      
      return parsed;
    } catch (err) {
      console.error('Failed to parse syllabus JSON:', err);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}; 
export const fetchAllMajors = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM major ORDER BY id');
};
