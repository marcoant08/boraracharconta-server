import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { Bill } from '@domain/entities/bill.entity';
import { Participant } from '@domain/value-objects/participant.vo';
import { CodeGeneratorService } from '@infrastructure/services/code-generator.service';

@Injectable()
export class CreateBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async execute(adminId: string, name: string): Promise<Bill> {
    // Buscar o usuário criador
    const user = await this.userRepository.findById(adminId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Criar participante com o usuário criador
    const adminParticipant = new Participant(
      adminId,
      user.name,
      false, // não é visitante
      new Date(),
    );

    let code: string;
    let codeExists = true;

    // Gerar código único
    while (codeExists) {
      code = this.codeGeneratorService.generateBillCode();
      const existingBill = await this.billRepository.findByCode(code);
      if (!existingBill) {
        codeExists = false;
      }
    }

    const bill = new Bill(
      '',
      code!,
      adminId,
      name,
      [adminParticipant],
      [],
      [],
      [],
      new Date(),
      new Date(),
    );

    return await this.billRepository.create(bill);
  }
}
