import express from 'express';
import { chatCopilot } from '../controllers/copilotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/chat', chatCopilot);

export default router;
