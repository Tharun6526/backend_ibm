import express from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { startInterviewSchema, submitAnswerSchema } from '../validators/interviewValidator.js';

const router = express.Router();

router.use(protect);

router.post('/start', validate(startInterviewSchema), interviewController.startInterview);
router.get('/history', interviewController.getInterviewHistory);
router.post('/:id/answer', validate(submitAnswerSchema), interviewController.submitAnswer);
router.post('/:id/evaluate', interviewController.evaluateAnswer);
router.get('/:id', interviewController.getInterviewById);

export default router;
