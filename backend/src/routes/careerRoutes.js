import express from 'express';
import * as careerController from '../controllers/careerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', careerController.getCareers);
router.post('/recommend', careerController.recommendCareers);
router.get('/recommendations', careerController.getRecommendations);
router.get('/:id', careerController.getCareerById);

export default router;
