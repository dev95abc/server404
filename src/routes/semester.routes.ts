import express from 'express';
import * as SemesterController from '../controller/semester.controller';

const router = express.Router();

router.get('/', SemesterController.getAllSemesters);
router.get('/:id', SemesterController.getSemesterById);
router.post('/', SemesterController.createSemester);
router.put('/:id', SemesterController.updateSemester);
router.delete('/:id', SemesterController.deleteSemester);

export default router;