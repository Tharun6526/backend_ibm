import express from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', uploadResume.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getResume);
router.post('/analyze', resumeController.analyzeResume);

export default router;
