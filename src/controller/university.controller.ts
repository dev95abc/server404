import { Request, Response } from "express";
import {
  fetchAllUniversities,
  fetchUniversityById,
  insertUniversity,
  updateUniversityById,
  deleteUniversityById,
} from "../models/university.model";

export const getAllUniversities = async (_req: Request, res: Response) => {
  try {
    const result = await fetchAllUniversities();
    console.log('hello')
    res.json(result);
  } catch (err) {
    console.error("Error fetching universities:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUniversityById = async (req: Request, res: Response)  => {
  try {
    const id = Number(req.params.id);
    const result = await fetchUniversityById(id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (err) {
    console.error("Error fetching university by ID:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createUniversity = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await insertUniversity(name);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating university:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUniversity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const result = await updateUniversityById(id, name);
    res.json(result);
  } catch (err) {
    console.error("Error updating university:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUniversity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteUniversityById(id);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting university:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};