import express from 'express';
import * as roadmapController from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateTaskStatusSchema } from '../validators/roadmapValidator.js';

const router = express.Router();

router.use(protect);

router.post('/generate', roadmapController.generateRoadmap);
router.get('/', roadmapController.getRoadmap);
router.put('/tasks/:id', validate(updateTaskStatusSchema), roadmapController.updateTaskStatus);
router.get('/:id', roadmapController.getRoadmapById);

export default router;
