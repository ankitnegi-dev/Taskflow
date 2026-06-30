import { UserRepository } from './user.repository';

export class UserService {
  private repo = new UserRepository();

  async getAllUsers() {
    return this.repo.findAll();
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      const error = new Error('User not found.') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async deleteUser(id: string) {
    await this.getUserById(id); // ensures user exists
    await this.repo.deleteById(id);
  }
}
