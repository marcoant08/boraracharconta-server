import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { Participant } from '@domain/value-objects/participant.vo';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class JoinBillByCodeUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(code: string, userId: string): Promise<void> {
    const bill = await this.billRepository.findByCode(code);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Verificar se usuário já é participante
    const isAlreadyParticipant = bill.participants.some(
      (p) => p.userId === userId,
    );

    if (isAlreadyParticipant) {
      return;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const participant = new Participant(userId, user.name, false, new Date()); // não é visitante

    await this.billRepository.addParticipant(bill.id, participant);

    // Emitir evento WebSocket para notificar outros participantes
    await this.billEventsService.emitParticipantAdded(bill.id);
  }
}
