import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class RemoveParticipantFromBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    participantId: string,
    userId: string,
  ): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    const participant = bill.participants.find(
      (p) => p.userId === participantId || p.name === participantId,
    );

    if (!participant) {
      throw new NotFoundException('Participante não encontrado');
    }

    // Verificar se está tentando remover o admin
    if (bill.adminId === participantId || bill.adminId === participant.userId) {
      throw new ForbiddenException('Não é possível remover o administrador da conta');
    }

    // Verificar autorização
    const isAdmin = bill.isAdmin(userId);
    const isVerifiedParticipant = bill.isVerifiedParticipant(userId);

    if (!isAdmin && !isVerifiedParticipant) {
      throw new ForbiddenException('Você não tem permissão para remover participantes');
    }

    // Se não for admin, só pode remover visitantes
    if (!isAdmin && !participant.isVisitor) {
      throw new ForbiddenException(
        'Você só pode remover participantes visitantes',
      );
    }

    await this.billRepository.removeParticipant(billId, participantId);

    // Emitir evento WebSocket
    await this.billEventsService.emitParticipantRemoved(billId, participantId);
  }
}
