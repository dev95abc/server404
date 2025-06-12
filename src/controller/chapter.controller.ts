import { Request, Response } from 'express';
import {
    fetchAllChapters,
    fetchChapterById,
    insertChapter,
    updateChapterById,
    deleteChapterById
} from '../models/chapter.model';

export const getAllChapters = async (_req: Request, res: Response) => {
    try {
        const data = await fetchAllChapters();
        res.json(data);
    } catch (error) {
        console.error('Error in getAllChapters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
  

export const getChapterById = async (req: Request, res: Response) => {
    const chapter = await fetchChapterById(Number(req.params.id));
    if (!chapter) res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
};

export const createChapter = async (req: Request, res: Response) => {
    const { name, courseId, moduleNumber, unitNumber } = req.body;
    const newChapter = await insertChapter(name, courseId, moduleNumber, unitNumber);
    res.status(201).json(newChapter);
};

export const updateChapter = async (req: Request, res: Response) => {
    const { name, moduleNumber, unitNumber } = req.body;
    const updated = await updateChapterById(Number(req.params.id), name, moduleNumber, unitNumber);
    res.json(updated);
};

export const deleteChapter = async (req: Request, res: Response) => {
    await deleteChapterById(Number(req.params.id));
    res.status(204).send();
};