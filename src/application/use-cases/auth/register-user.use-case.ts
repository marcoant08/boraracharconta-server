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
    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Gerar nome do email se não fornecido
    const userName = name || email.split('@')[0];

    // Hash da senha
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Gerar código de verificação
    const verificationCode =
      this.codeGeneratorService.generateVerificationCode();

    // Criar usuário
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

    // // Enviar email com código
    // await this.emailService.sendVerificationCode(email, verificationCode);

    return { message: 'Usuário criado com sucesso. Verifique seu email.' };
  }
}
