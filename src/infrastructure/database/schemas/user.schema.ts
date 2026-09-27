import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthProviderName } from '@domain/entities/user.entity';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserProvider {
  @Prop({ required: true, enum: ['google', 'github'], type: String })
  provider: AuthProviderName;

  @Prop({ required: true, type: String })
  providerId: string;
}

export const UserProviderSchema = SchemaFactory.createForClass(UserProvider);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationCode: string;

  @Prop({ type: [UserProviderSchema], default: [] })
  providers: UserProvider[];
}

export const UserSchema = SchemaFactory.createForClass(User);
