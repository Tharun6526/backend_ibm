import { searchLiveJobs } from '../services/jobService.js';

export const getLiveJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    const jobs = await searchLiveJobs(userId, query);
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};
