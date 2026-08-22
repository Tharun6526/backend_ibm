import { asyncHandler } from '../utils/asyncHandler.js';
import * as resumeService from '../services/resumeService.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No resume file uploaded. Please upload a PDF or DOCX file.'
    });
  }

  const processed = await resumeService.uploadAndProcessResume(req.user.id, req.file);
  res.status(201).json(processed);
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getLatestResume(req.user.id);
  res.status(200).json(resume);
});

export const analyzeResume = asyncHandler(async (req, res) => {
  const result = await resumeService.analyzeResumeAIOnly(req.user.id);
  res.status(200).json(result);
});
