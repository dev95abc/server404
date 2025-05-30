// src/routes/major.routes.ts
import express from 'express';
import {
  getAllMajors, 
  getParsedSyllabus
} from '../controller/grok.controller';

const router = express.Router();

router.post('/', getAllMajors); 
router.get('/', getParsedSyllabus); 
export default router;
