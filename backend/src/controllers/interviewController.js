import { asyncHandler } from '../utils/asyncHandler.js';
import * as interviewService from '../services/interviewService.js';

export const startInterview = asyncHandler(async (req, res) => {
  const result = await interviewService.startInterview(req.user.id, req.body);
  res.status(201).json(result);
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const result = await interviewService.submitAnswer(
    req.params.id,
    req.user.id,
    req.body
  );
  res.status(200).json(result);
});

export const evaluateAnswer = asyncHandler(async (req, res) => {
  const result = await interviewService.evaluateAnswer(
    req.params.id,
    req.user.id,
    req.body
  );
  res.status(200).json(result);
});

export const getInterviewHistory = asyncHandler(async (req, res) => {
  const history = await interviewService.getInterviewHistory(req.user.id);
  res.status(200).json(history);
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await interviewService.getInterviewById(req.params.id, req.user.id);
  res.status(200).json(interview);
});
