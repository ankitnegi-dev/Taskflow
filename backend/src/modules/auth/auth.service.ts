import { AuthRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { RegisterDto, LoginDto } from './auth.validation';
import { UserRole } from '../../types';

export class AuthService {
  private repo = new AuthRepository();

  async register(dto: RegisterDto) {
    // Check for duplicate email
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      const error = new Error('An account with this email already exists.') as Error & { statusCode: number };
      error.statusCode = 409;
      throw error;
    }

    const hashed = await hashPassword(dto.password);
    const user = await this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findByEmail(dto.email);

    // Use consistent error to prevent email enumeration
    const invalidCredentials = new Error('Invalid email or password.') as Error & { statusCode: number };
    invalidCredentials.statusCode = 401;

    if (!user) throw invalidCredentials;

    const passwordMatch = await comparePassword(dto.password, user.password);
    if (!passwordMatch) throw invalidCredentials;

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      const error = new Error('User not found.') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
