import express from 'express';
import * as githubController from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { connectGithubSchema } from '../validators/githubValidator.js';

const router = express.Router();

router.use(protect);

router.post('/connect', validate(connectGithubSchema), githubController.connectGithub);
router.get('/profile', githubController.getGithubProfile);
router.get('/repositories', githubController.getGithubRepositories);
router.post('/analyze', githubController.analyzeGithub);

export default router;
