import express from 'express';
import {
getAllTopics,
getTopicById,
createTopic,
updateTopic,
deleteTopic
} from '../controller/topic.controller';

const router = express.Router();

router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;