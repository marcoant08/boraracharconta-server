import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';
import { BillDetail } from '@infrastructure/database/schemas/bill-detail.schema';

@Injectable()
export class UpdateBillDetailUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    itemId: string,
    userId: string,
    quantityConsumed: number,
    action: 'join' | 'left',
  ): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Verificar se item existe
    const itemExists = bill.items.some((i) => i.id === itemId);
    if (!itemExists) {
      throw new NotFoundException('Item não encontrado');
    }

    // Verificar se participante existe
    const participant = bill.participants.find(
      (p) => p.userId === userId || p.name === userId,
    );
    if (!participant) {
      throw new NotFoundException('Participante não encontrado');
    }

    // Verificar se detail existe
    const detailExists = bill.details?.some(
      (d) => d.userId === userId && d.itemId === itemId,
    );
    if (!detailExists) {
      throw new NotFoundException('Detail não encontrado');
    }

    // Calcular estado atual do participante (antes da atualização)
    // Para update, vamos considerar o estado antes do último evento
    const currentState = this.getParticipantCurrentStateForUpdate(
      bill.details || [],
      userId,
      itemId,
      participant.joinedAt,
      bill.createdAt,
    );

    // Validar ação baseada no estado atual
    if (action === 'join' && currentState === 'present') {
      throw new BadRequestException(
        'Participante já está na mesa. Não é possível fazer join novamente.',
      );
    }

    if (action === 'left' && currentState === 'absent') {
      throw new BadRequestException(
        'Participante não está na mesa. Não é possível fazer left.',
      );
    }

    await this.billRepository.updateBillDetail(
      billId,
      itemId,
      userId,
      quantityConsumed,
      action,
    );

    // Emitir evento WebSocket
    await this.billEventsService.emitBillDetailUpdated(
      billId,
      itemId,
      userId,
      quantityConsumed,
      action,
    );
  }

  private getParticipantCurrentStateForUpdate(
    details: BillDetail[],
    userId: string,
    itemId: string,
    participantJoinedAt: Date,
    billCreatedAt: Date,
  ): 'present' | 'absent' {
    // Filtrar details do participante para este item
    const participantDetails = (details || []).filter(
      (d) => d.userId === userId && d.itemId === itemId,
    );

    if (participantDetails.length === 0) {
      // Estado inicial: presente se joinedAt é anterior ou igual à criação da bill
      return participantJoinedAt <= billCreatedAt ? 'present' : 'absent';
    }

    if (participantDetails.length === 1) {
      // Se há apenas um detail, o estado antes dele é o estado inicial
      const initialState = participantJoinedAt <= billCreatedAt ? 'present' : 'absent';
      // Se o único evento é 'join', estava ausente antes (estado inicial era 'absent' ou mudou)
      // Se o único evento é 'left', estava presente antes (estado inicial era 'present')
      return participantDetails[0].action === 'join' ? 'absent' : initialState;
    }

    // Se há múltiplos details, o estado antes do último é determinado pelo penúltimo
    // Se penúltimo foi 'join', estava presente antes do último evento
    // Se penúltimo foi 'left', estava ausente antes do último evento
    const secondToLast = participantDetails[participantDetails.length - 2];
    return secondToLast.action === 'join' ? 'present' : 'absent';
  }
}
