import express from 'express';
import {
getAllChapters,
getChapterById,
createChapter,
updateChapter,
deleteChapter
} from '../controller/chapter.controller';

const router = express.Router();

router.get('/', getAllChapters);
router.get('/:id', getChapterById);
router.post('/', createChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

export default router;