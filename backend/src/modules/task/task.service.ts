import { TaskRepository } from './task.repository';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  SubmitActualDto,
} from './task.validation';
import { UserRole } from '../../types';
import { buildPaginationMeta } from '../../utils/response';
import { Task } from '@prisma/client';

export class TaskService {
  private repo = new TaskRepository();

  async getTasks(query: TaskQueryDto, userId: string, userRole: UserRole) {
    const { tasks, total } = await this.repo.findAll(query, userId, userRole);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { tasks, meta };
  }

  async getTaskById(id: string, userId: string, userRole: UserRole) {
    const task = await this.repo.findById(id);
    this.ensureExists(task);
    this.ensureOwnership(task!, userId, userRole);
    return task;
  }

  async createTask(dto: CreateTaskDto, userId: string) {
    return this.repo.create(dto, userId);
  }

  async updateTask(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    userRole: UserRole
  ) {
    const task = await this.repo.findById(id);
    this.ensureExists(task);
    this.ensureOwnership(task!, userId, userRole);
    return this.repo.update(id, dto);
  }

  async deleteTask(id: string, userId: string, userRole: UserRole) {
    const task = await this.repo.findById(id);
    this.ensureExists(task);
    this.ensureOwnership(task!, userId, userRole);
    return this.repo.delete(id);
  }

  // --- Commitment Mirror: task-level methods ----------------------

  async submitActual(
    id: string,
    dto: SubmitActualDto,
    userId: string,
    userRole: UserRole
  ) {
    const task = await this.repo.findById(id);
    this.ensureExists(task);
    this.ensureOwnership(task!, userId, userRole);
    return this.repo.submitActual(id, dto);
  }

  async getWeeklySummary(weekStart: Date, userId: string) {
    const weekEnd = this.addDays(weekStart, 7);
    const tasks = await this.repo.findByWeek(userId, weekStart, weekEnd);
    const { plannedHours, actualHours, truthScore } = this.computeHours(tasks);

    return {
      weekStart,
      weekEnd,
      plannedHours,
      actualHours,
      truthScore,
      taskCount: tasks.length,
      completedCount: tasks.filter((t) => t.completed).length,
    };
  }

  async getDailyTruthScore(date: Date, userId: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const tasks = await this.repo.findByDay(userId, dayStart, dayEnd);
    const { plannedHours, actualHours, truthScore } = this.computeHours(tasks);

    return {
      date: dayStart,
      plannedHours,
      actualHours,
      truthScore,
    };
  }

  // --- Commitment Mirror: WeeklyReceipt persistence -----------------

  /**
   * Computes the weekly summary (same as getWeeklySummary) and persists
   * it as a WeeklyReceipt row. Re-generating for an already-saved week
   * updates that week's receipt rather than creating a duplicate.
   */
  async generateWeeklyReceipt(weekStart: Date, userId: string) {
    const weekEnd = this.addDays(weekStart, 7);
    const tasks = await this.repo.findByWeek(userId, weekStart, weekEnd);
    const { plannedHours, actualHours, truthScore } = this.computeHours(tasks);

    const receipt = await this.repo.upsertWeeklyReceipt(userId, weekStart, {
      plannedHours,
      actualHours,
      truthScore,
    });

    return {
      ...receipt,
      weekEnd,
      taskCount: tasks.length,
      completedCount: tasks.filter((t) => t.completed).length,
    };
  }

  async listWeeklyReceipts(userId: string, page: number, limit: number) {
    const { receipts, total } = await this.repo.findWeeklyReceipts(userId, page, limit);
    const meta = buildPaginationMeta(total, page, limit);
    return { receipts, meta };
  }

  // --- Private Helpers -----------------------------------------------

  private computeHours(tasks: Task[]) {
    let plannedHours = 0;
    let actualHours = 0;

    for (const task of tasks) {
      if (task.plannedStart && task.plannedEnd) {
        plannedHours +=
          (task.plannedEnd.getTime() - task.plannedStart.getTime()) / 3_600_000;
      }
      if (task.actualStart && task.actualEnd) {
        actualHours +=
          (task.actualEnd.getTime() - task.actualStart.getTime()) / 3_600_000;
      }
    }

    const truthScore =
      plannedHours > 0
        ? Math.min(100, Math.max(0, (actualHours / plannedHours) * 100))
        : 0;

    return {
      plannedHours: Number(plannedHours.toFixed(2)),
      actualHours: Number(actualHours.toFixed(2)),
      truthScore: Number(truthScore.toFixed(1)),
    };
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private ensureExists(task: unknown): void {
    if (!task) {
      const error = new Error('Task not found.') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
  }

  private ensureOwnership(
    task: { createdById: string },
    userId: string,
    userRole: UserRole
  ): void {
    if (userRole === UserRole.ADMIN) return;
    if (task.createdById !== userId) {
      const error = new Error('You do not have permission to access this task.') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }
  }
}