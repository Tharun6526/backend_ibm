import { asyncHandler } from '../utils/asyncHandler.js';
import * as roadmapService from '../services/roadmapService.js';

export const generateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.generateUserRoadmap(req.user.id);
  res.status(201).json(roadmap);
});

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.getUserRoadmap(req.user.id);
  res.status(200).json(roadmap);
});

export const getRoadmapById = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.getRoadmapById(req.params.id, req.user.id);
  res.status(200).json(roadmap);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const updatedTask = await roadmapService.updateRoadmapTaskStatus(
    req.params.id,
    req.user.id,
    req.body.status
  );
  res.status(200).json(updatedTask);
});
