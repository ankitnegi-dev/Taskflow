import { prisma } from '../../config/database';
import { Task, WeeklyReceipt, Prisma, TaskEnergy } from '@prisma/client';
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

  // --- Commitment Mirror: task-level methods --------------------------

  async submitActual(
    id: string,
    data: {
      actualStart?: Date;
      actualEnd?: Date;
      completed: boolean;
      energy?: TaskEnergy;
    }
  ): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async findByWeek(userId: string, weekStart: Date, weekEnd: Date): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        createdById: userId,
        OR: [
          { plannedStart: { gte: weekStart, lte: weekEnd } },
          { actualStart: { gte: weekStart, lte: weekEnd } },
        ],
      },
      orderBy: { plannedStart: 'asc' },
    });
  }

  async findByDay(userId: string, dayStart: Date, dayEnd: Date): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        createdById: userId,
        OR: [
          { plannedStart: { gte: dayStart, lte: dayEnd } },
          { actualStart: { gte: dayStart, lte: dayEnd } },
        ],
      },
    });
  }

  // --- Commitment Mirror: WeeklyReceipt persistence --------------------

  async upsertWeeklyReceipt(
    userId: string,
    weekStart: Date,
    data: {
      plannedHours: number;
      actualHours: number;
      truthScore: number;
      aiSummary?: string;
    }
  ): Promise<WeeklyReceipt> {
    return prisma.weeklyReceipt.upsert({
      where: {
        userId_weekStart: { userId, weekStart },
      },
      update: data,
      create: {
        userId,
        weekStart,
        ...data,
      },
    });
  }

  async findWeeklyReceipts(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ receipts: WeeklyReceipt[]; total: number }> {
    const skip = (page - 1) * limit;

    const [receipts, total] = await prisma.$transaction([
      prisma.weeklyReceipt.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { weekStart: 'desc' },
      }),
      prisma.weeklyReceipt.count({ where: { userId } }),
    ]);

    return { receipts, total };
  }

  async findWeeklyReceiptByWeek(
    userId: string,
    weekStart: Date
  ): Promise<WeeklyReceipt | null> {
    return prisma.weeklyReceipt.findUnique({
      where: {
        userId_weekStart: { userId, weekStart },
      },
    });
  }
}