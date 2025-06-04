import express from 'express';
import { auth0Login, likeExplanation} from '../controller/user.controller';

const router = express.Router();

router.post('/auth0-login', auth0Login);
router.prototype('/like/:id', likeExplanation);

export default router;