/**
 * Unit tests for TaskService
 * Run: npm test
 */

import { TaskService } from '../modules/task/task.service';
import { TaskRepository } from '../modules/task/task.repository';
import { UserRole } from '../types';

// Mock dependencies
jest.mock('../modules/task/task.repository');
jest.mock('../config/database');

const MockedRepo = TaskRepository as jest.MockedClass<typeof TaskRepository>;

describe('TaskService', () => {
  let taskService: TaskService;

  const ownerId = 'user-uuid-1';
  const otherUserId = 'user-uuid-2';

  const mockTask = {
    id: 'task-uuid-1',
    title: 'Write unit tests',
    description: 'Add coverage for TaskService',
    status: 'TODO' as const,
    priority: 'MEDIUM' as const,
    dueDate: null,
    plannedStart: null,
    plannedEnd: null,
    actualStart: null,
    actualEnd: null,
    completed: false,
    energy: null,
    createdById: ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
  });

  // ─── getTasks ────────────────────────────────────────────────────────────

  describe('getTasks', () => {
    it('should return paginated tasks with meta', async () => {
      MockedRepo.prototype.findAll.mockResolvedValue({
        tasks: [mockTask],
        total: 1,
      });

      const result = await taskService.getTasks(
        { page: 1, limit: 10 } as any,
        ownerId,
        UserRole.USER
      );

      expect(result.tasks).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(MockedRepo.prototype.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        ownerId,
        UserRole.USER
      );
    });
  });

  // ─── getTaskById ─────────────────────────────────────────────────────────

  describe('getTaskById', () => {
    it('should return the task when owner requests it', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(mockTask.id, ownerId, UserRole.USER);

      expect(result).toEqual(mockTask);
    });

    it('should return the task when an admin requests it (bypasses ownership)', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(mockTask.id, otherUserId, UserRole.ADMIN);

      expect(result).toEqual(mockTask);
    });

    it('should throw 404 if task does not exist', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(null);

      await expect(
        taskService.getTaskById('non-existent', ownerId, UserRole.USER)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if a non-owner non-admin user requests it', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);

      await expect(
        taskService.getTaskById(mockTask.id, otherUserId, UserRole.USER)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ─── createTask ──────────────────────────────────────────────────────────

  describe('createTask', () => {
    it('should create a task for the given user', async () => {
      MockedRepo.prototype.create.mockResolvedValue(mockTask);

      const dto = {
        title: 'Write unit tests',
        description: 'Add coverage for TaskService',
        status: 'TODO',
        priority: 'MEDIUM',
      } as any;

      const result = await taskService.createTask(dto, ownerId);

      expect(result).toEqual(mockTask);
      expect(MockedRepo.prototype.create).toHaveBeenCalledWith(dto, ownerId);
    });
  });

  // ─── updateTask ──────────────────────────────────────────────────────────

  describe('updateTask', () => {
    it('should update the task when the owner requests it', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);
      MockedRepo.prototype.update.mockResolvedValue({
        ...mockTask,
        title: 'Updated title',
      });

      const result = await taskService.updateTask(
        mockTask.id,
        { title: 'Updated title' } as any,
        ownerId,
        UserRole.USER
      );

      expect(result.title).toBe('Updated title');
    });

    it('should throw 403 if a non-owner non-admin user tries to update', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);

      await expect(
        taskService.updateTask(
          mockTask.id,
          { title: 'Hacked title' } as any,
          otherUserId,
          UserRole.USER
        )
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(MockedRepo.prototype.update).not.toHaveBeenCalled();
    });

    it('should throw 404 if task does not exist', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(null);

      await expect(
        taskService.updateTask('non-existent', { title: 'X' } as any, ownerId, UserRole.USER)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── deleteTask ──────────────────────────────────────────────────────────

  describe('deleteTask', () => {
    it('should delete the task when the owner requests it', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);
      MockedRepo.prototype.delete.mockResolvedValue(mockTask);

      await taskService.deleteTask(mockTask.id, ownerId, UserRole.USER);

      expect(MockedRepo.prototype.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it('should allow an admin to delete a task they do not own', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);
      MockedRepo.prototype.delete.mockResolvedValue(mockTask);

      await taskService.deleteTask(mockTask.id, otherUserId, UserRole.ADMIN);

      expect(MockedRepo.prototype.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it('should throw 403 if a non-owner non-admin user tries to delete', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockTask);

      await expect(
        taskService.deleteTask(mockTask.id, otherUserId, UserRole.USER)
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(MockedRepo.prototype.delete).not.toHaveBeenCalled();
    });

    it('should throw 404 if task does not exist', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(null);

      await expect(
        taskService.deleteTask('non-existent', ownerId, UserRole.USER)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
