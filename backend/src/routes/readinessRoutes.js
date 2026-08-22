import express from 'express';
import * as readinessController from '../controllers/readinessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', readinessController.getReadiness);
router.post('/calculate', readinessController.calculateReadiness);

export default router;
