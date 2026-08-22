import express from 'express';
import * as skillController from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/user', skillController.getUserSkills);
router.get('/gaps', skillController.getSkillGaps);
router.post('/analyze', skillController.analyzeSkillGap);

export default router;
