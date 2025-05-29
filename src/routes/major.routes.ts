// src/routes/major.routes.ts
import express from 'express';
import {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
} from '../controller/major.controller';

const router = express.Router();

router.get('/', getAllMajors);
router.get('/:id', getMajorById);
router.post('/', createMajor);
router.put('/:id', updateMajor);
router.delete('/:id', deleteMajor);

export default router;
