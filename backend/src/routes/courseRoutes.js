import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', courseController.getCourses);
router.get('/recommended', courseController.getRecommendedCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id/progress', courseController.updateCourseProgress);

export default router;
