 
import { Request, Response } from 'express';
import * as majorModel from '../models/major.model';
export const getAllMajors = async (_req: Request, res: Response) => {
  const majors = await majorModel.fetchAllMajors();
  res.json(majors);
};

export const getMajorById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const major = await majorModel.fetchMajorById(id);
  if (!major)   res.status(404).json({ message: 'Major not found' });
  res.json(major);
};

export const createMajor = async (req: Request, res: Response) => {
  const { name, universityId } = req.body;
  const newMajor = await majorModel.insertMajor(name, universityId);
  res.status(201).json(newMajor);
};

export const updateMajor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const updated = await majorModel.updateMajorById(id, name);
  res.json(updated);
};

export const deleteMajor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await majorModel.deleteMajorById(id);
  res.status(204).send();
};
