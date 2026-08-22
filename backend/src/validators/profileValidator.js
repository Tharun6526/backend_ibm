import { z } from 'zod';

export const profileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    college: z.string().optional(),
    degree: z.string().optional(),
    branch: z.string().optional(),
    graduationYear: z.number().int().min(1990).max(2035).optional(),
    careerGoal: z.string().optional(),
    experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    hoursPerDay: z.number().int().min(1).max(24).optional(),
    preferredLearningStyle: z.string().optional(),
    targetMonths: z.number().int().min(1).max(36).optional()
  })
});
