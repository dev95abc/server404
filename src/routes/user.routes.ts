import express from 'express';
import { auth0Login } from '../controller/user.controller';

const router = express.Router();

router.post('/auth0-login', auth0Login);

export default router;