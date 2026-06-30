import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../../types';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional(),
  status: z
    .nativeEnum(TaskStatus, {
      errorMap: () => ({ message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}` }),
    })
    .default(TaskStatus.TODO),
  priority: z
    .nativeEnum(TaskPriority, {
      errorMap: () => ({ message: `Priority must be one of: ${Object.values(TaskPriority).join(', ')}` }),
    })
    .default(TaskPriority.MEDIUM),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title', 'priority'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
