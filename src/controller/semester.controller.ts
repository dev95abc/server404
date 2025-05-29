import { Request, Response } from 'express';
import * as SemesterModel from '../models/semester.model';

export const getAllSemesters = async (req: Request, res: Response) => {
try {
const semesters = await SemesterModel.fetchAllSemesters();
res.json(semesters);
} catch (error) {
res.status(500).json({ message: 'Failed to fetch semesters', error });
}
};

export const getSemesterById = async (req: Request, res: Response) => {
try {
const id = Number(req.params.id);
const semester = await SemesterModel.fetchSemesterById(id);
if (!semester) {
  res.status(404).json({ message: 'Semester not found' });
}
res.json(semester);
} catch (error) {
res.status(500).json({ message: 'Failed to fetch semester', error });
}
};

export const createSemester = async (req: Request, res: Response) => {
try {
const { major_id, name } = req.body;
const newSemester = await SemesterModel.insertSemester(major_id, name);
res.status(201).json(newSemester);
} catch (error) {
res.status(500).json({ message: 'Failed to create semester', error });
}
};

export const updateSemester = async (req: Request, res: Response) => {
try {
const id = Number(req.params.id);
const { major_id, name } = req.body;
const updatedSemester = await SemesterModel.updateSemesterById(id, major_id, name);
res.json(updatedSemester);
} catch (error) {
res.status(500).json({ message: 'Failed to update semester', error });
}
};

export const deleteSemester = async (req: Request, res: Response) => {
try {
const id = Number(req.params.id);
await SemesterModel.deleteSemesterById(id);
res.json({ message: 'Semester deleted successfully' });
} catch (error) {
res.status(500).json({ message: 'Failed to delete semester', error });
}
};