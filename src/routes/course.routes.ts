import express from 'express';
import * as CourseController from '../controller/course.controller';

const router = express.Router();

router.get('/', CourseController.getAllCourses); 
router.get('/getAllDet/:id', CourseController.getAllDetailsByCourseId);
router.get('/getCourseByMajorId/:id', CourseController.getAllCourseByMajorId);
router.post('/', CourseController.createCourse);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

export default router;