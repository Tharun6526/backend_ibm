import { asyncHandler } from '../utils/asyncHandler.js';
import * as profileService from '../services/profileService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  res.status(200).json(profile);
});

export const createProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.createOrUpdateProfile(req.user.id, req.body);
  res.status(201).json(profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.createOrUpdateProfile(req.user.id, req.body);
  res.status(200).json(profile);
});
