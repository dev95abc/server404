import { Request, Response } from 'express';
import * as explanationModel from '../models/explanation.model';

export const getAllExplanations = async (req: Request, res: Response) => {
  try {
    const explanations = await explanationModel.fetchAllExplanations();
    res.json(explanations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch explanations', error });
  }
};

export const getExplanationById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const explanation = await explanationModel.fetchExplanationById(id);
    if (!explanation) {
      res.status(404).json({ message: 'Explanation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ex-planation', error });
  }
};

export const getExplanationsByTopicId = async (req: Request, res: Response) => {

  console.log('getExplanationsByTopicId get called')
  const topicId = Number(req.params.topicId);
  const chpId = Number(req.params.chpId);
  const topicTitle: string = req.body.title
  const contextString: string = req.body.title

  console.log(topicId)
  try {
    const explanations = await explanationModel.fetchExplanationsByTopicId(topicId);
    if (explanations.length === 0) {
      const newExplanation = await explanationModel.generateExplanation(topicId, chpId, topicTitle,contextString);
      res.status(201).json([newExplanation]);

      const res1 = await explanationModel.insertExplanation(topicId, newExplanation.prompt, newExplanation.text, newExplanation.likes);
      if (res1) {
        console.log('genreated...')
      }
    } else {
      console.log('explanations from database')
      const enrichedExplanations = await Promise.all(
        explanations.map(async (explanation) => {
          const likedbys = await explanationModel.fetchLikedUserIdsByExplanationId(explanation.id);
          const learnedBy = await explanationModel.fetchLearnedUserIdsByExplanationId(topicId);
          return { ...explanation, liked_by: likedbys, learned_by: learnedBy};
        })
      );

      res.json(enrichedExplanations);
 
    }

  } catch (error) {
    console.log('error in get expn', error)
    res.status(500).json({ message: 'Failed to fetch explanations by topic', error });
  }
};

export const createExplanation = async (req: Request, res: Response) => {
  const { topicId, content } = req.body;
  if (!topicId || !content) {
    res.status(400).json({ message: 'topicId and content are required' });
  }
  try {
    // const newExplanation = await explanationModel.insertExplanation(topicId, content);
    // res.status(201).json(newExplanation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create explanation', error });
  }
};

export const updateExplanation = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ message: 'content is required' });
  }
  try {
    const updatedExplanation = await explanationModel.updateExplanationById(id, content);
    res.json(updatedExplanation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update explanation', error });
  }
};

export const deleteExplanation = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await explanationModel.deleteExplanationById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete explanation', error });
  }
};
