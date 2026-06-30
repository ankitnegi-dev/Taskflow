/**
 * Unit tests for AuthService
 * Run: npm test
 */

import { AuthService } from '../modules/auth/auth.service';
import { AuthRepository } from '../modules/auth/auth.repository';
import * as passwordUtils from '../utils/password';
import * as jwtUtils from '../utils/jwt';

// Mock dependencies
jest.mock('../modules/auth/auth.repository');
jest.mock('../utils/password');
jest.mock('../utils/jwt');
jest.mock('../config/database');

const MockedRepo = AuthRepository as jest.MockedClass<typeof AuthRepository>;
const mockedHash = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;
const mockedCompare = passwordUtils.comparePassword as jest.MockedFunction<typeof passwordUtils.comparePassword>;
const mockedSign = jwtUtils.signToken as jest.MockedFunction<typeof jwtUtils.signToken>;

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser = {
    id: 'user-uuid-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'USER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create a new user and return token', async () => {
      MockedRepo.prototype.findByEmail.mockResolvedValue(null);
      MockedRepo.prototype.create.mockResolvedValue(mockUser);
      mockedHash.mockResolvedValue('hashed_password');
      mockedSign.mockReturnValue('mock.jwt.token');

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(mockedHash).toHaveBeenCalledWith('SecurePass123');
    });

    it('should throw 409 if email already exists', async () => {
      MockedRepo.prototype.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'SecurePass123',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('already exists'),
      });
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      MockedRepo.prototype.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(true);
      mockedSign.mockReturnValue('mock.jwt.token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'SecurePass123',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw 401 when user not found', async () => {
      MockedRepo.prototype.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'Pass123' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 on wrong password', async () => {
      MockedRepo.prototype.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(mockUser);

      const profile = await authService.getProfile(mockUser.id);
      expect(profile.id).toBe(mockUser.id);
      expect(profile).not.toHaveProperty('password');
    });

    it('should throw 404 if user not found', async () => {
      MockedRepo.prototype.findById.mockResolvedValue(null);

      await expect(authService.getProfile('non-existent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
