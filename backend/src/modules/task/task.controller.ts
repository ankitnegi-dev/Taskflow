import { Response } from 'express';
import { TaskService } from './task.service';
import { AuthenticatedRequest, UserRole } from '../../types';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './task.validation';

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
