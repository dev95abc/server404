// src/routes/major.routes.ts
import express from 'express';
import {
  getAllMajors, 
  getParsedSyllabus
} from '../controller/grok.controller';

const router = express.Router();


router.post('/', getParsedSyllabus); 




// router.post('/', getAllMajors); 
export default router;
