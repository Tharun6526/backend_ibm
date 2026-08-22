import prisma from '../config/database.js';

export const getProfile = async (userId) => {
  let profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
        experienceLevel: 'BEGINNER',
        hoursPerDay: 2,
        targetMonths: 6
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  return profile;
};

export const createOrUpdateProfile = async (userId, profileData) => {
  const {
    name,
    college,
    degree,
    branch,
    graduationYear,
    careerGoal,
    experienceLevel,
    hoursPerDay,
    preferredLearningStyle,
    targetMonths
  } = profileData;

  // Transactionally update User name if provided & update Profile fields
  return await prisma.$transaction(async (tx) => {
    if (name) {
      await tx.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    const updatedProfile = await tx.profile.upsert({
      where: { userId },
      update: {
        ...(college !== undefined && { college }),
        ...(degree !== undefined && { degree }),
        ...(branch !== undefined && { branch }),
        ...(graduationYear !== undefined && { graduationYear }),
        ...(careerGoal !== undefined && { careerGoal }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(hoursPerDay !== undefined && { hoursPerDay }),
        ...(preferredLearningStyle !== undefined && { preferredLearningStyle }),
        ...(targetMonths !== undefined && { targetMonths })
      },
      create: {
        userId,
        college,
        degree,
        branch,
        graduationYear,
        careerGoal,
        experienceLevel: experienceLevel || 'BEGINNER',
        hoursPerDay: hoursPerDay || 2,
        preferredLearningStyle,
        targetMonths: targetMonths || 6
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return updatedProfile;
  });
};
