import prisma from '../config/database.js';
import { aiService } from '../ai/aiService.js';

export const getUserSkills = async (userId) => {
  return await prisma.userSkill.findMany({
    where: { userId },
    orderBy: { level: 'desc' }
  });
};

export const getSkillGaps = async (userId) => {
  const gaps = await prisma.skillGap.findMany({
    where: { userId },
    orderBy: { gap: 'desc' }
  });

  if (gaps.length === 0) {
    return await analyzeSkillGapsForUser(userId);
  }

  return gaps.map((g) => ({
    id: g.id,
    skill: g.skill,
    currentLevel: g.currentLevel,
    requiredLevel: g.requiredLevel,
    gap: g.gap,
    priority: g.priority,
    recommendedActions: g.recommendedActions
  }));
};

export const analyzeSkillGapsForUser = async (userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const userSkills = await prisma.userSkill.findMany({ where: { userId } });

  const aiGaps = await aiService.analyzeSkillGap({
    targetCareer: profile?.careerGoal || 'Software Developer',
    currentSkills: userSkills
  });

  await prisma.$transaction(async (tx) => {
    for (const g of aiGaps) {
      await tx.skillGap.upsert({
        where: {
          userId_skill: {
            userId,
            skill: g.skill
          }
        },
        update: {
          currentLevel: g.currentLevel,
          requiredLevel: g.requiredLevel,
          gap: g.gap,
          priority: g.priority,
          recommendedActions: g.recommendedActions
        },
        create: {
          userId,
          skill: g.skill,
          currentLevel: g.currentLevel,
          requiredLevel: g.requiredLevel,
          gap: g.gap,
          priority: g.priority,
          recommendedActions: g.recommendedActions
        }
      });
    }
  });

  return await getSkillGaps(userId);
};
