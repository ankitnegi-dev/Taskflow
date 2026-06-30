import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './task.validation';
import { UserRole } from '../../types';
import { buildPaginationMeta } from '../../utils/response';

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

  // ─── Private Helpers ─────────────────────────────────────────────────────────

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
    if (userRole === UserRole.ADMIN) return; // ADMIN bypasses ownership check
    if (task.createdById !== userId) {
      const error = new Error('You do not have permission to access this task.') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }
  }
}
