import { asyncHandler } from '../utils/asyncHandler.js';
import * as githubService from '../services/githubService.js';

export const connectGithub = asyncHandler(async (req, res) => {
  const result = await githubService.connectGithubUser(req.user.id, req.body.username);
  res.status(200).json(result);
});

export const getGithubProfile = asyncHandler(async (req, res) => {
  const profile = await githubService.getGithubProfile(req.user.id);
  res.status(200).json(profile);
});

export const getGithubRepositories = asyncHandler(async (req, res) => {
  const repos = await githubService.getGithubRepositories(req.user.id);
  res.status(200).json(repos);
});

export const analyzeGithub = asyncHandler(async (req, res) => {
  const analysis = await githubService.analyzeGithubUser(req.user.id);
  res.status(200).json(analysis);
});
