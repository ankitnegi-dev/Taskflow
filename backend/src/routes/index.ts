import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import taskRoutes from '../modules/task/task.routes';
import userRoutes from '../modules/user/user.routes';
import { sendSuccess } from '../utils/response';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }, 'Server is running');
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
