import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@taskflow.io',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User@123456', 12);
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@taskflow.io',
      password: userPassword,
      role: Role.USER,
    },
  });

  // Create sample tasks for admin
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        createdById: admin.id,
      },
      {
        title: 'Write API documentation',
        description: 'Document all endpoints with Swagger/OpenAPI spec.',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        createdById: admin.id,
      },
    ],
  });

  // Create sample tasks for user
  await prisma.task.createMany({
    data: [
      {
        title: 'Build authentication module',
        description: 'Implement JWT-based auth with bcrypt password hashing.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        createdById: user.id,
      },
      {
        title: 'Add pagination to task list',
        description: 'Implement cursor-based or offset-based pagination.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: user.id,
      },
      {
        title: 'Write unit tests',
        description: 'Cover auth and task service with Jest tests.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: user.id,
      },
    ],
  });

  console.log(`✅ Seed complete!`);
  console.log(`   Admin: admin@taskflow.io / Admin@123456`);
  console.log(`   User:  john@taskflow.io  / User@123456`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
