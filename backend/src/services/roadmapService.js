import prisma from '../config/database.js';
import { aiService } from '../ai/aiService.js';

export const generateUserRoadmap = async (userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const skillGaps = await prisma.skillGap.findMany({ where: { userId } });

  const targetCareer = profile?.careerGoal || 'Software Developer';
  const hoursPerDay = profile?.hoursPerDay || 2;
  const targetMonths = profile?.targetMonths || 6;

  const aiTasks = await aiService.generateRoadmap({
    targetCareer,
    skillGaps,
    experienceLevel: profile?.experienceLevel || 'BEGINNER',
    hoursPerDay,
    targetMonths
  });

  const createdRoadmap = await prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.create({
      data: {
        userId,
        title: `Personalized ${targetCareer} Roadmap`,
        targetCareer,
        durationMonths: targetMonths
      }
    });

    let index = 0;
    for (const t of aiTasks) {
      await tx.roadmapTask.create({
        data: {
          roadmapId: roadmap.id,
          title: t.title,
          description: t.description,
          skill: t.skill,
          duration: t.duration,
          priority: t.priority || 'MEDIUM',
          status: t.status || 'NOT_STARTED',
          resources: t.resources || [],
          orderIndex: index++
        }
      });
    }

    return roadmap;
  });

  return await getRoadmapById(createdRoadmap.id, userId);
};

export const getUserRoadmap = async (userId) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!roadmap) {
    // If no roadmap exists yet, generate one
    return await generateUserRoadmap(userId);
  }

  return formatRoadmapResponse(roadmap);
};

export const getRoadmapById = async (id, userId) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { id, userId },
    include: {
      tasks: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!roadmap) {
    const error = new Error('Roadmap not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  return formatRoadmapResponse(roadmap);
};

export const updateRoadmapTaskStatus = async (taskId, userId, status) => {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: { roadmap: true }
  });

  if (!task || task.roadmap.userId !== userId) {
    const error = new Error('Roadmap task not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  const updatedTask = await prisma.roadmapTask.update({
    where: { id: taskId },
    data: { status }
  });

  return updatedTask;
};

const formatRoadmapResponse = (roadmap) => {
  return {
    id: roadmap.id,
    title: roadmap.title,
    targetCareer: roadmap.targetCareer,
    durationMonths: roadmap.durationMonths,
    tasks: roadmap.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      skill: t.skill,
      duration: t.duration,
      priority: t.priority,
      status: t.status,
      resources: t.resources
    }))
  };
};
