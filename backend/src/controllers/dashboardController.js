import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.user.id);
  res.status(200).json(data);
});
