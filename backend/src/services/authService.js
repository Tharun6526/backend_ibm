import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      profile: {
        create: {
          experienceLevel: 'BEGINNER',
          hoursPerDay: 2,
          targetMonths: 6
        }
      },
      jobReadiness: {
        create: {
          overallScore: 50,
          technicalSkills: 50,
          dsa: 40,
          projects: 50,
          resume: 50,
          github: 40,
          interview: 50,
          status: 'NEEDS_WORK',
          improvements: ['Complete profile onboarding', 'Upload resume for AI analysis']
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  const token = generateToken(user.id);

  return {
    token,
    user
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};
