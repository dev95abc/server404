import express from 'express';
import * as explanationController from '../controller/explanation.controller';

const router = express.Router();

router.get('/', explanationController.getAllExplanations);
router.get('/:id', explanationController.getExplanationById);
router.get('/topic/:topicId', explanationController.getExplanationsByTopicId);
router.post('/', explanationController.createExplanation);
router.put('/:id', explanationController.updateExplanation);
router.delete('/:id', explanationController.deleteExplanation);

export default router;
