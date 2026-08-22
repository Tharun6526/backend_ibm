import { asyncHandler } from '../utils/asyncHandler.js';
import * as readinessService from '../services/readinessService.js';

export const getReadiness = asyncHandler(async (req, res) => {
  const readiness = await readinessService.getReadiness(req.user.id);
  res.status(200).json(readiness);
});

export const calculateReadiness = asyncHandler(async (req, res) => {
  const readiness = await readinessService.calculateReadiness(req.user.id);
  res.status(200).json(readiness);
});
