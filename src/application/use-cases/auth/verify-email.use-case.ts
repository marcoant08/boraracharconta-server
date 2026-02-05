import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string, code: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Código de verificação inválido');
    }

    const updatedUser = new User(
      user.id,
      user.email,
      user.password,
      user.name,
      true,
      user.emailVerificationCode,
      user.createdAt,
      new Date(),
    );

    await this.userRepository.update(updatedUser);

    return { message: 'Email verificado com sucesso' };
  }
}
