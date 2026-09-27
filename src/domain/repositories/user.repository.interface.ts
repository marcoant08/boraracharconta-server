import { AuthProviderName, User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailCaseInsensitive(email: string): Promise<User | null>;
  findByProvider(
    provider: AuthProviderName,
    providerId: string,
  ): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
