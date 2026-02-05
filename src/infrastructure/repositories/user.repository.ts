import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User as UserDocument, UserDocument as UserDoc } from '../database/schemas/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDoc>,
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel({
      email: user.email,
      password: user.password,
      name: user.name,
      emailVerified: user.emailVerified,
      emailVerificationCode: user.emailVerificationCode,
    });
    const saved = await createdUser.save();
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
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
          password: user.password,
          name: user.name,
          emailVerified: user.emailVerified,
          emailVerificationCode: user.emailVerificationCode,
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
    return new User(
      user._id.toString(),
      user.email,
      user.password,
      user.name,
      user.emailVerified,
      user.emailVerificationCode,
      (user as any).createdAt || new Date(),
      (user as any).updatedAt || new Date(),
    );
  }
}
