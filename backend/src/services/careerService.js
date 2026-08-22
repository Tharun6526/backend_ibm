import prisma from '../config/database.js';
import { aiService } from '../ai/aiService.js';

export const getAllCareers = async () => {
  return await prisma.career.findMany({
    orderBy: { title: 'asc' }
  });
};

export const getCareerById = async (id) => {
  const career = await prisma.career.findUnique({
    where: { id }
  });

  if (!career) {
    const error = new Error('Career track not found');
    error.statusCode = 404;
    throw error;
  }

  return career;
};

export const recommendCareersForUser = async (userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { skills: true, projects: true }
  });
  const github = await prisma.githubProfile.findUnique({
    where: { userId },
    include: { repositories: true }
  });

  const aiRecommendations = await aiService.recommendCareer({
    profile,
    resumeSkills: resume?.skills || [],
    githubData: github,
    targetGoal: profile?.careerGoal
  });

  // Save to database transactionally
  await prisma.$transaction(async (tx) => {
    // Delete existing recommendations for clean slate
    await tx.careerRecommendation.deleteMany({ where: { userId } });

    for (const rec of aiRecommendations) {
      const dbCareer = await tx.career.findFirst({
        where: { title: { equals: rec.career, mode: 'insensitive' } }
      });

      await tx.careerRecommendation.create({
        data: {
          userId,
          careerId: dbCareer?.id || null,
          careerName: rec.career,
          matchPercentage: rec.matchPercentage,
          reasons: rec.reasons,
          requiredSkills: rec.requiredSkills
        }
      });
    }
  });

  return await getCareerRecommendations(userId);
};

export const getCareerRecommendations = async (userId) => {
  const recommendations = await prisma.careerRecommendation.findMany({
    where: { userId },
    orderBy: { matchPercentage: 'desc' }
  });

  if (recommendations.length === 0) {
    // If none present, trigger generator once
    return await recommendCareersForUser(userId);
  }

  return recommendations.map((r) => ({
    id: r.id,
    career: r.careerName,
    matchPercentage: r.matchPercentage,
    reasons: r.reasons,
    requiredSkills: r.requiredSkills
  }));
};
