import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { PasswordService } from '@infrastructure/services/password.service';
import { CodeGeneratorService } from '@infrastructure/services/code-generator.service';
import { EmailService } from '@infrastructure/services/email.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly codeGeneratorService: CodeGeneratorService,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser?.emailVerified) {
      throw new ConflictException('Email já está em uso');
    }

    const userName = name || email.split('@')[0];
    const hashedPassword = await this.passwordService.hashPassword(password);
    const verificationCode =
      this.codeGeneratorService.generateVerificationCode();

    if (existingUser && !existingUser.emailVerified) {
      const updatedUser = new User(
        existingUser.id,
        email,
        hashedPassword,
        userName,
        false,
        verificationCode,
        existingUser.createdAt,
        new Date(),
      );
      await this.userRepository.update(updatedUser);
    } else {
      const user = new User(
        '',
        email,
        hashedPassword,
        userName,
        false,
        verificationCode,
        new Date(),
        new Date(),
      );
      await this.userRepository.create(user);
    }

    await this.emailService.sendVerificationCode(email, verificationCode);

    return { message: 'Usuário criado com sucesso. Verifique seu email.' };
  }
}
