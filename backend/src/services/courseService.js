import prisma from '../config/database.js';

export const getAllCourses = async (userId) => {
  const courses = await prisma.course.findMany({
    orderBy: { courseName: 'asc' }
  });

  const progresses = await prisma.courseProgress.findMany({
    where: { userId }
  });

  const progressMap = {};
  progresses.forEach((p) => {
    progressMap[p.courseId] = p;
  });

  return courses.map((c) => ({
    id: c.id,
    courseName: c.courseName,
    provider: c.provider,
    skillName: c.skillName,
    difficulty: c.difficulty,
    duration: c.duration,
    description: c.description,
    externalUrl: c.externalUrl,
    userProgress: progressMap[c.id]?.progress || 0,
    completionStatus: progressMap[c.id]?.completionStatus || false
  }));
};

export const getRecommendedCourses = async (userId) => {
  const skillGaps = await prisma.skillGap.findMany({
    where: { userId },
    orderBy: { gap: 'desc' }
  });

  const gapSkills = skillGaps.map((g) => g.skill.toLowerCase());

  const allCourses = await getAllCourses(userId);

  if (gapSkills.length === 0) {
    return allCourses.slice(0, 4);
  }

  // Filter courses that address user's skill gaps
  const recommended = allCourses.filter((c) =>
    gapSkills.some((gSkill) => c.skillName.toLowerCase().includes(gSkill) || c.courseName.toLowerCase().includes(gSkill))
  );

  return recommended.length > 0 ? recommended : allCourses.slice(0, 4);
};

export const getCourseById = async (id, userId) => {
  const course = await prisma.course.findUnique({
    where: { id }
  });

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const progressRecord = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: id
      }
    }
  });

  return {
    id: course.id,
    courseName: course.courseName,
    provider: course.provider,
    skillName: course.skillName,
    difficulty: course.difficulty,
    duration: course.duration,
    description: course.description,
    externalUrl: course.externalUrl,
    userProgress: progressRecord?.progress || 0,
    completionStatus: progressRecord?.completionStatus || false
  };
};

export const updateCourseProgress = async (courseId, userId, progress) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const progressVal = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
  const completionStatus = progressVal === 100;

  const updatedProgress = await prisma.courseProgress.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
    update: {
      progress: progressVal,
      completionStatus
    },
    create: {
      userId,
      courseId,
      progress: progressVal,
      completionStatus
    }
  });

  return {
    courseId,
    progress: updatedProgress.progress,
    completionStatus: updatedProgress.completionStatus,
    updatedAt: updatedProgress.updatedAt
  };
};
