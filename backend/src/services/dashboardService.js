import prisma from '../config/database.js';

export const getDashboardData = async (userId) => {
  // Fetch persisted user data concurrently
  const [profile, recommendation, readiness, userSkills, skillGaps, roadmap] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.careerRecommendation.findFirst({
      where: { userId },
      orderBy: { matchPercentage: 'desc' }
    }),
    prisma.jobReadiness.findUnique({ where: { userId } }),
    prisma.userSkill.findMany({ where: { userId } }),
    prisma.skillGap.findMany({
      where: { userId },
      orderBy: { gap: 'desc' },
      take: 5
    }),
    prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        tasks: {
          take: 5,
          orderBy: { orderIndex: 'asc' }
        }
      }
    })
  ]);

  // Recommended career & match percentage
  const recommendedCareer = recommendation?.careerName || profile?.careerGoal || 'Software Developer';
  const careerMatch = recommendation?.matchPercentage || 85;

  // Job Readiness Score
  const readinessScore = readiness?.overallScore || 50;

  // Average Skill Score
  let skillScore = 70;
  if (userSkills.length > 0) {
    const sum = userSkills.reduce((acc, s) => acc + s.level, 0);
    skillScore = Math.round(sum / userSkills.length);
  }

  // Top Skill Gaps formatted
  const topSkillGaps = skillGaps.map((g) => ({
    skill: g.skill,
    currentLevel: g.currentLevel,
    requiredLevel: g.requiredLevel,
    gap: g.gap,
    priority: g.priority,
    recommendedActions: g.recommendedActions
  }));

  // Today's Roadmap Tasks
  const todayTasks = (roadmap?.tasks || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    skill: t.skill,
    duration: t.duration,
    priority: t.priority,
    status: t.status,
    resources: t.resources
  }));

  return {
    careerMatch,
    readinessScore,
    skillScore,
    recommendedCareer,
    topSkillGaps,
    todayTasks
  };
};
