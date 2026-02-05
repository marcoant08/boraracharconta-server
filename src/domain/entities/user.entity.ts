export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  emailVerified: boolean;
  emailVerificationCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    email: string,
    password: string,
    name: string,
    emailVerified: boolean,
    emailVerificationCode: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.emailVerified = emailVerified;
    this.emailVerificationCode = emailVerificationCode;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
