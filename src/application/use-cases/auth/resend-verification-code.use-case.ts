import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { CodeGeneratorService } from '@infrastructure/services/code-generator.service';
import { EmailService } from '@infrastructure/services/email.service';

@Injectable()
export class ResendVerificationCodeUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly codeGeneratorService: CodeGeneratorService,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    const newCode = this.codeGeneratorService.generateVerificationCode();

    const updatedUser = new User(
      user.id,
      user.email,
      user.password,
      user.name,
      user.emailVerified,
      newCode,
      user.createdAt,
      new Date(),
      user.providers,
    );

    await this.userRepository.update(updatedUser);
    await this.emailService.sendVerificationCode(email, newCode);

    return { message: 'Código de verificação reenviado' };
  }
}
