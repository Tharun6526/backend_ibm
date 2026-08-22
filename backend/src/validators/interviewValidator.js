import { z } from 'zod';

export const startInterviewSchema = z.object({
  body: z.object({
    type: z.enum(['TECHNICAL', 'HR', 'BEHAVIORAL', 'DSA', 'JAVA', 'FULL_STACK']).optional().default('TECHNICAL'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM')
  })
});

export const submitAnswerSchema = z.object({
  body: z.object({
    questionId: z.string().uuid('Valid questionId required'),
    answerText: z.string().min(1, 'Answer text is required')
  }),
  params: z.object({
    id: z.string().uuid()
  })
});
