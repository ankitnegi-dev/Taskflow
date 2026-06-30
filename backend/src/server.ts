import app from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    logger.info(`
    ┌─────────────────────────────────────────────┐
    │           🚀 TaskFlow API Server             │
    ├─────────────────────────────────────────────┤
    │  Environment : ${config.env.padEnd(27)}│
    │  Port        : ${String(config.port).padEnd(27)}│
    │  API Base    : /api/v1                      │
    │  Swagger     : /api-docs                    │
    │  Health      : /api/v1/health               │
    └─────────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    shutdown('unhandledRejection').catch(() => process.exit(1));
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
