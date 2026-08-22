import { asyncHandler } from '../utils/asyncHandler.js';
import * as careerService from '../services/careerService.js';

export const getCareers = asyncHandler(async (req, res) => {
  const careers = await careerService.getAllCareers();
  res.status(200).json(careers);
});

export const recommendCareers = asyncHandler(async (req, res) => {
  const recommendations = await careerService.recommendCareersForUser(req.user.id);
  res.status(200).json(recommendations);
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await careerService.getCareerRecommendations(req.user.id);
  res.status(200).json(recommendations);
});

export const getCareerById = asyncHandler(async (req, res) => {
  const career = await careerService.getCareerById(req.params.id);
  res.status(200).json(career);
});
