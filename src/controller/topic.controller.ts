import { Request, Response } from 'express';
import {
    fetchAllTopics,
    fetchTopicById,
    insertTopic,
    updateTopicById,
    deleteTopicById
} from '../models/topic.model';

export const getAllTopics = async (_req: Request, res: Response) => {
    const data = await fetchAllTopics();
    res.json(data);
};

export const getTopicById = async (req: Request, res: Response) => {
    const topic = await fetchTopicById(Number(req.params.id));
    if (!topic)   res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
};

export const createTopic = async (req: Request, res: Response) => {
    const { name, chapterId } = req.body;
    const newTopic = await insertTopic(name, chapterId);
    res.status(201).json(newTopic);
};

export const updateTopic = async (req: Request, res: Response) => {
    const { name } = req.body;
    const updated = await updateTopicById(Number(req.params.id), name);
    res.json(updated);
};

export const deleteTopic = async (req: Request, res: Response) => {
    await deleteTopicById(Number(req.params.id));
    res.status(204).send();
};