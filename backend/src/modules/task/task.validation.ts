import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../../types';
import { TaskEnergy } from '@prisma/client';

const baseTaskSchema = z.object({
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
  dueDate: z.coerce.date().optional(),
  // -- Commitment Mirror: when the user plans to work on this --
  plannedStart: z.coerce.date().optional(),
  plannedEnd: z.coerce.date().optional(),
  energy: z.nativeEnum(TaskEnergy).optional(),
});

const plannedRangeRefinement = (data: { plannedStart?: Date; plannedEnd?: Date }) =>
  !data.plannedStart || !data.plannedEnd || data.plannedEnd >= data.plannedStart;

export const createTaskSchema = baseTaskSchema.refine(plannedRangeRefinement, {
  message: 'plannedEnd must be after plannedStart',
  path: ['plannedEnd'],
});

export const updateTaskSchema = baseTaskSchema.partial().refine(plannedRangeRefinement, {
  message: 'plannedEnd must be after plannedStart',
  path: ['plannedEnd'],
});

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

// --- Commitment Mirror schemas ---------------------------------------

export const submitActualSchema = z
  .object({
    actualStart: z.coerce.date().optional(),
    actualEnd: z.coerce.date().optional(),
    completed: z.boolean({ required_error: 'completed is required' }),
    energy: z.nativeEnum(TaskEnergy).optional(),
  })
  .refine(
    (data) => !data.actualStart || !data.actualEnd || data.actualEnd >= data.actualStart,
    { message: 'actualEnd must be after actualStart', path: ['actualEnd'] }
  );

export const weeklySummaryQuerySchema = z.object({
  weekStart: z.coerce.date({
    required_error: 'weekStart is required (ISO date string)',
  }),
});

export const dailyTruthScoreQuerySchema = z.object({
  date: z.coerce.date({
    required_error: 'date is required (ISO date string)',
  }),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
export type SubmitActualDto = z.infer<typeof submitActualSchema>;
export type WeeklySummaryQueryDto = z.infer<typeof weeklySummaryQuerySchema>;
export type DailyTruthScoreQueryDto = z.infer<typeof dailyTruthScoreQuerySchema>;