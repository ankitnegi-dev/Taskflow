import { Response } from 'express';
import { TaskService } from './task.service';
import { AuthenticatedRequest, UserRole } from '../../types';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  SubmitActualDto,
  WeeklySummaryQueryDto,
  DailyTruthScoreQueryDto,
  GenerateReceiptDto,
  ListReceiptsQueryDto,
} from './task.validation';

const taskService = new TaskService();

/** GET /api/v1/tasks */
export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const query = req.query as unknown as TaskQueryDto;
  const { tasks, meta } = await taskService.getTasks(
    query,
    req.user!.userId,
    req.user!.role as UserRole
  );
  sendSuccess(res, tasks, 'Tasks retrieved successfully', 200, meta);
};

/** GET /api/v1/tasks/:id */
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await taskService.getTaskById(
    req.params.id,
    req.user!.userId,
    req.user!.role as UserRole
  );
  sendSuccess(res, task, 'Task retrieved successfully');
};

/** POST /api/v1/tasks */
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const dto = req.body as CreateTaskDto;
  const task = await taskService.createTask(dto, req.user!.userId);
  sendCreated(res, task, 'Task created successfully');
};

/** PUT /api/v1/tasks/:id */
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const dto = req.body as UpdateTaskDto;
  const task = await taskService.updateTask(
    req.params.id,
    dto,
    req.user!.userId,
    req.user!.role as UserRole
  );
  sendSuccess(res, task, 'Task updated successfully');
};

/** DELETE /api/v1/tasks/:id */
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await taskService.deleteTask(
    req.params.id,
    req.user!.userId,
    req.user!.role as UserRole
  );
  sendNoContent(res);
};

// --- Commitment Mirror: task-level handlers --------------------------

/** POST /api/v1/tasks/:id/actual */
export const submitActual = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const dto = req.body as SubmitActualDto;
  const task = await taskService.submitActual(
    req.params.id,
    dto,
    req.user!.userId,
    req.user!.role as UserRole
  );
  sendSuccess(res, task, 'Daily review submitted successfully');
};

/** GET /api/v1/tasks/weekly-summary */
export const getWeeklySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { weekStart } = req.query as unknown as WeeklySummaryQueryDto;
  const summary = await taskService.getWeeklySummary(weekStart, req.user!.userId);
  sendSuccess(res, summary, 'Weekly summary retrieved successfully');
};

/** GET /api/v1/tasks/daily-truth-score */
export const getDailyTruthScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { date } = req.query as unknown as DailyTruthScoreQueryDto;
  const score = await taskService.getDailyTruthScore(date, req.user!.userId);
  sendSuccess(res, score, 'Daily truth score retrieved successfully');
};

// --- Commitment Mirror: WeeklyReceipt handlers ------------------------

/** POST /api/v1/tasks/weekly-receipts/generate */
export const generateWeeklyReceipt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { weekStart } = req.body as GenerateReceiptDto;
  const receipt = await taskService.generateWeeklyReceipt(weekStart, req.user!.userId);
  sendCreated(res, receipt, 'Weekly receipt generated successfully');
};

/** GET /api/v1/tasks/weekly-receipts */
export const listWeeklyReceipts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as unknown as ListReceiptsQueryDto;
  const { receipts, meta } = await taskService.listWeeklyReceipts(req.user!.userId, page, limit);
  sendSuccess(res, receipts, 'Weekly receipts retrieved successfully', 200, meta);
};