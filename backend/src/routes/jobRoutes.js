import express from 'express';
import { getLiveJobs } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/search', getLiveJobs);

export default router;
