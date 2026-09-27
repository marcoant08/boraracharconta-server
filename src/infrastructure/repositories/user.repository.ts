import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthProviderName,
  User,
  UserAuthProvider,
} from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import {
  User as UserDocument,
  UserDocument as UserDoc,
} from '../database/schemas/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDoc>,
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel({
      email: user.email,
      ...(user.password ? { password: user.password } : {}),
      name: user.name,
      emailVerified: user.emailVerified,
      emailVerificationCode: user.emailVerificationCode,
      providers: user.providers ?? [],
    });
    const saved = await createdUser.save();
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toDomain(user) : null;
  }

  async findByEmailCaseInsensitive(email: string): Promise<User | null> {
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await this.userModel
      .findOne({ email: { $regex: new RegExp(`^${escaped}$`, 'i') } })
      .exec();
    return user ? this.toDomain(user) : null;
  }

  async findByProvider(
    provider: AuthProviderName,
    providerId: string,
  ): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        providers: { $elemMatch: { provider, providerId } },
      })
      .exec();
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toDomain(user) : null;
  }

  async update(user: User): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        user.id,
        {
          email: user.email,
          ...(user.password ? { password: user.password } : {}),
          name: user.name,
          emailVerified: user.emailVerified,
          emailVerificationCode: user.emailVerificationCode,
          providers: user.providers ?? [],
        },
        { new: true },
      )
      .exec();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  private toDomain(user: UserDoc): User {
    const providers: UserAuthProvider[] = (user.providers || []).map(
      (provider) => ({
        provider: provider.provider,
        providerId: provider.providerId,
      }),
    );

    return new User(
      user._id.toString(),
      user.email,
      user.password ?? null,
      user.name,
      user.emailVerified,
      user.emailVerificationCode,
      (user as any).createdAt || new Date(),
      (user as any).updatedAt || new Date(),
      providers,
    );
  }
}
