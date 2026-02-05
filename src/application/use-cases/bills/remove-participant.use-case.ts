import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';

@Injectable()
export class RemoveParticipantFromBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
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

    // Verificar autorização
    const isAdmin = bill.isAdmin(userId);
    const isVerifiedParticipant = bill.isVerifiedParticipant(userId);

    if (!isAdmin && !isVerifiedParticipant) {
      throw new ForbiddenException('Você não tem permissão para remover participantes');
    }

    // Se não for admin, só pode remover visitantes
    if (!isAdmin && participant.userId) {
      throw new ForbiddenException(
        'Você só pode remover participantes visitantes',
      );
    }

    await this.billRepository.removeParticipant(billId, participantId);
  }
}
