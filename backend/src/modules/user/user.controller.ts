import { Response } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from '../../types';
import { sendSuccess, sendNoContent } from '../../utils/response';

const userService = new UserService();

/** GET /api/v1/users  [ADMIN only] */
export const getAllUsers = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const users = await userService.getAllUsers();
  sendSuccess(res, users, 'Users retrieved successfully');
};

/** GET /api/v1/users/:id  [ADMIN only] */
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user, 'User retrieved successfully');
};

/** DELETE /api/v1/users/:id  [ADMIN only] */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  await userService.deleteUser(req.params.id);
  sendNoContent(res);
};
