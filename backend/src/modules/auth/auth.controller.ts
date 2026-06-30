import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendCreated } from '../../utils/response';
import { RegisterDto, LoginDto } from './auth.validation';

const authService = new AuthService();

/**
 * POST /api/v1/auth/register
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const dto = req.body as RegisterDto;
  const result = await authService.register(dto);
  sendCreated(res, result, 'Account created successfully');
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const dto = req.body as LoginDto;
  const result = await authService.login(dto);
  sendSuccess(res, result, 'Login successful');
};

/**
 * GET /api/v1/auth/profile  [Protected]
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.userId;
  const profile = await authService.getProfile(userId);
  sendSuccess(res, profile, 'Profile retrieved successfully');
};
