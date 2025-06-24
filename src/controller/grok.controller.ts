
import { Request, Response } from 'express';
import * as majorModel from '../models/grok.model';
import { insertCourseHierarchy } from '../models/course.model';

const testData = `
comece | comer [|
wows | smumormatesoing |
MODULE -1

Unit 1: Introduction to Simulation and Statistical Models

Introduction to Simulation: System and System environment, Components of
system, Type of systems, Type of models, Steps in simulation study, Advantages
and Disadvantages of simulation.
 

Unit 2: Random Number Generation, Random Variate Generation, Input
Modeling, and Output Analysis

Random Number Generation: Properties of random numbers, Generation of
pseudo random numbers, Techniques for generating random numbers, Tests for
random numbers.`


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
export const getAllMajors = async (_req: Request, res: Response) => {
  const majors = await majorModel.fetchAllMajors();
  res.json(majors);
};

export function organizeByModulesAndUnits(chapters: any) {
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

export const getParsedSyllabus = async (_req: Request, res: Response) => {
  const {textData,major_id }= _req.body 

  
  console.log('this is textData', textData, "major id : ",major_id)
//TODO: add tryCatch block
  //this return an compact object by the plain text
  // const parsed = await majorModel.parseSyllabus(textData);
  // const formatedParsedData = organizeByModulesAndUnits(parsed?.modules)
  if (textData) {
    textData.major_id =major_id;
    console.log('this is parsed running ')
    //this saves the data in database,  i takes the copact object as input
    const letSee = await insertCourseHierarchy(textData)
    res.json(letSee);
  }
 res.json({status: 'not working '});
};