import express from 'express';
import { auth0Login, likeExplanation, addLearnedTopic, getLearnedTopics} from '../controller/user.controller';

const router = express.Router();

router.post('/auth0-login', auth0Login);
router.post('/like/:id', likeExplanation);
router.post('/learned_topics/:id', addLearnedTopic);
router.get('/learned_topics/:id', getLearnedTopics);

export default router;