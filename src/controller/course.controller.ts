import { Request, Response } from 'express';
import * as CourseModel from '../models/course.model';
import { fetchChapterById } from '../models/chapter.model';
import { fetchTopicById, fetchTopicWithLearnedStatus } from '../models/topic.model';
import { fetchExplanationById } from '../models/explanation.model';

interface Topic {
  id: number;
  title: string;
  // ... other topic fields
}

interface Chapter {
  id: number;
  name: string;
  module_number: number;
  unit_number: number;
  topics: Topic[];
  // ... other chapter fields
}

interface Unit {
  unit_number: number;
  chapters: Chapter[];
}

interface Module {
  module_number: number;
  units: Unit[];
}

interface CourseWithHierarchy {
  // ... your existing course fields
  modules: Module[];
}


export function organizeByModulesAndUnits(chapters: Chapter[]): CourseWithHierarchy {
  console.log('test')
  // First group by module_number
  const modulesMap = new Map<number, Module>();

  for (const chapter of chapters) {
    // Get or create the module
    if (!modulesMap.has(chapter.module_number)) {
      modulesMap.set(chapter.module_number, {
        module_number: chapter.module_number,
        units: []
      });
    }
    const module = modulesMap.get(chapter.module_number)!;

    // Find or create the unit within this module
    let unit = module.units.find(u => u.unit_number === chapter.unit_number);
    if (!unit) {
      unit = { unit_number: chapter.unit_number, chapters: [] };
      module.units.push(unit);
    }

    // Add the chapter to the unit
    unit.chapters.push(chapter);
  }

  // Convert map to sorted array
  const modules = Array.from(modulesMap.values())
    .sort((a, b) => a.module_number - b.module_number);

  // Sort units within each module
  modules.forEach(module => {
    module.units.sort((a, b) => a.unit_number - b.unit_number);

    // Sort chapters within each unit (if needed)
    module.units.forEach(unit => {
      unit.chapters.sort((a, b) => a.id - b.id); // or another sorting criteria
    });
  });

  return { modules };
}

export async function getLastVisitedCourseByUser(req: Request, res: Response) {
  // const userId = parseInt(req.params.userId, 10);

  const userId = Number(req.params.id);
  // const userId = Number(req.params.id);
  console.log('userId:', req.params.id, 'params:', req.params);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user_id parameter' });
  } else {
    try {
      const course = await CourseModel.getVisitedCourses(userId);
      console.log('Last visited course:', course);

      if (!course) {
        res.status(404).json({ message: 'No course visits found for this user.' });
      } else {

        res.status(200).json(course);
      }

    } catch (error) {
      console.error('Error fetching last visited course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const getAllDetailsByCourseId = async (req: Request, res: Response) => {
  try {

    console.log('called', req.body)
    const id = Number(req.params.id);
    const { auth0_id } = req.body;
    let entityLength = 0;

    // Fetch course details
    const course = await CourseModel.fetchCourseById(id);
    console.log('course =>>', course, 'params =>', req.params)
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
    }

    // Fetch chapters
    const chapters = await fetchChapterById(id);

    // Fetch topics and explanations for each chapter
    const chaptersWithContent = await Promise.all(
      chapters.map(async (chapter) => {
        const topics = await fetchTopicById(chapter.id);
        console.log('topics =>>', topics.length)
        entityLength += topics.length;
        // const lernedstatus = await fetchTopicWithLearnedStatus(chapter.id, auth0_id);

        return {
          ...chapter,
          topics,

        };
      })
    );

    const final = organizeByModulesAndUnits(chaptersWithContent)
    await CourseModel.recordCourseVisitAndTrim(auth0_id, id);


    res.json({
      ...course,
      modules: final.modules,
      topicLength: entityLength
    });
  } catch (error) {
    console.error('Error in getAllDetailsByCourseId:', error);
    res.status(500).json({
      message: req,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getAllCourseByMajorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const courses = await CourseModel.fetchAllCoursesByMajorId(id);
    res.json(courses);
  } catch (error) {
    console.log('Failed to fetch courses : ',error)
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
};

























































































export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await CourseModel.fetchAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {

    //how can i call getAllCourses() here

    const id = Number(req.params.id);
    const course = await CourseModel.fetchCourseById(id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { semester_id, name } = req.body;
    const newCourse = await CourseModel.insertCourse(semester_id, name);
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course', error });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { semester_id, name } = req.body;
    const updatedCourse = await CourseModel.updateCourseById(id, semester_id, name);
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course', error });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await CourseModel.deleteCourseById(id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course', error });
  }
};