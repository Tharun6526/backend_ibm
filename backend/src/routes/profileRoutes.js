import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { profileSchema } from '../validators/profileValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.post('/', validate(profileSchema), profileController.createProfile);
router.put('/', validate(profileSchema), profileController.updateProfile);

export default router;
