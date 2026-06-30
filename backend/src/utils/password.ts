import bcrypt from 'bcryptjs';
import { config } from '../config';

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, config.bcrypt.rounds);
};

export const comparePassword = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
