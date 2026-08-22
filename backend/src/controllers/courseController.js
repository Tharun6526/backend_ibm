import { asyncHandler } from '../utils/asyncHandler.js';
import * as courseService from '../services/courseService.js';

export const getCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getAllCourses(req.user.id);
  res.status(200).json(courses);
});

export const getRecommendedCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getRecommendedCourses(req.user.id);
  res.status(200).json(courses);
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user.id);
  res.status(200).json(course);
});

export const updateCourseProgress = asyncHandler(async (req, res) => {
  const progress = await courseService.updateCourseProgress(
    req.params.id,
    req.user.id,
    req.body.progress
  );
  res.status(200).json(progress);
});
