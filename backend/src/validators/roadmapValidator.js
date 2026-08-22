import { z } from 'zod';

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
  }),
  params: z.object({
    id: z.string().uuid()
  })
});
