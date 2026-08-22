import { asyncHandler } from '../utils/asyncHandler.js';
import * as skillService from '../services/skillService.js';

export const getUserSkills = asyncHandler(async (req, res) => {
  const skills = await skillService.getUserSkills(req.user.id);
  res.status(200).json(skills);
});

export const getSkillGaps = asyncHandler(async (req, res) => {
  const gaps = await skillService.getSkillGaps(req.user.id);
  res.status(200).json(gaps);
});

export const analyzeSkillGap = asyncHandler(async (req, res) => {
  const gaps = await skillService.analyzeSkillGapsForUser(req.user.id);
  res.status(200).json(gaps);
});
