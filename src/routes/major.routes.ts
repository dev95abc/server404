// src/routes/major.routes.ts
import express from 'express';
import {
  getAllMajors,
  getAllMajorsByUniversityId,
  createMajor,
  updateMajor,
  deleteMajor,
} from '../controller/major.controller';

const router = express.Router();

router.get('/', getAllMajors);
// router.get('/', getAllMajors);
router.get('/:id', getAllMajorsByUniversityId);
router.post('/', createMajor);
router.put('/:id', updateMajor);
router.delete('/:id', deleteMajor);

export default router;
