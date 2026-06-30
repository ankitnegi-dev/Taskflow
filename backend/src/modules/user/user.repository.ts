import { prisma } from '../../config/database';
import { User } from '@prisma/client';

export class UserRepository {
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
