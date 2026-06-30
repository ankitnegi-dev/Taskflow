import { prisma } from '../../config/database';
import { Task, Prisma } from '@prisma/client';
import { TaskQueryDto, CreateTaskDto, UpdateTaskDto } from './task.validation';
import { UserRole } from '../../types';

export class TaskRepository {
  async findAll(
    query: TaskQueryDto,
    userId: string,
    userRole: UserRole
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build WHERE clause — ADMIN sees all, USER sees only own
    const where: Prisma.TaskWhereInput = {
      ...(userRole !== UserRole.ADMIN && { createdById: userId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        title: { contains: search, mode: Prisma.QueryMode.insensitive },
      }),
    };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    return prisma.task.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: dto,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({ where: { id } });
  }
}
