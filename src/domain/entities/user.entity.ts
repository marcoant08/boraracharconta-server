export type AuthProviderName = 'google' | 'github';

export interface UserAuthProvider {
  provider: AuthProviderName;
  providerId: string;
}

export class User {
  id: string;
  email: string;
  password: string | null;
  name: string;
  emailVerified: boolean;
  emailVerificationCode: string;
  createdAt: Date;
  updatedAt: Date;
  providers: UserAuthProvider[];

  constructor(
    id: string,
    email: string,
    password: string | null,
    name: string,
    emailVerified: boolean,
    emailVerificationCode: string,
    createdAt: Date,
    updatedAt: Date,
    providers: UserAuthProvider[] = [],
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.emailVerified = emailVerified;
    this.emailVerificationCode = emailVerificationCode;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.providers = providers;
  }
}
