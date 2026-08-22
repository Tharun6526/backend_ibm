export const clampScore = (value) => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

export const calculateSkillGap = (currentLevel, requiredLevel) => {
  const cur = clampScore(currentLevel);
  const req = clampScore(requiredLevel);
  return Math.max(0, req - cur);
};

export const determineReadinessStatus = (overallScore) => {
  if (overallScore >= 85) return 'JOB_READY';
  if (overallScore >= 70) return 'ALMOST_READY';
  if (overallScore >= 50) return 'NEEDS_WORK';
  return 'NOT_READY';
};
