import express from 'express';
import * as explanationController from '../controller/explanation.controller';

const router = express.Router();

router.get('/', explanationController.getAllExplanations);
router.get('/:id', explanationController.getExplanationById);
router.post('/topic/:topicId/:chpId', explanationController.getExplanationsByTopicId);
// No overload matches this call.
//   The last overload gave the following error.
//     Argument of type '(req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>' is not assignable to parameter of type 'Application<Record<string, any>>'.
router.post('/', explanationController.createExplanation);
router.put('/:id', explanationController.updateExplanation);
router.delete('/:id', explanationController.deleteExplanation);

export default router;
