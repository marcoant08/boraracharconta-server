import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillDetail } from '@domain/entities/bill-detail.entity';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class AddBillDetailUseCase {
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
    console.log("[participant]", participant);
    if (!participant) {
      throw new NotFoundException('Participante não encontrado');
    }

    // Calcular estado atual do participante na linha do tempo
    const billDetails = bill.details || [];
    const currentState = this.getParticipantCurrentState(
      billDetails,
      userId,
      itemId,
    );

    // Validar ação baseada no estado atual
    const isFirstJoin = billDetails.filter(
      (d) => d.userId === userId && d.itemId === itemId,
    ).length === 0;
    if (action === 'join' && currentState === 'present' && !isFirstJoin) {
      throw new BadRequestException(
        'Participante já está na mesa. Não é possível fazer join novamente.',
      );
    }

    if (action === 'left' && currentState === 'absent') {
      throw new BadRequestException(
        'Participante não está na mesa. Não é possível fazer left.',
      );
    }

    const detail = new BillDetail(itemId, userId, quantityConsumed, action);

    await this.billRepository.addBillDetail(billId, detail);

    // Emitir evento WebSocket
    await this.billEventsService.emitBillDetailAdded(billId, detail);
  }

  private getParticipantCurrentState(
    details: BillDetail[],
    userId: string,
    itemId: string,
  ): 'present' | 'absent' {
    // Filtrar details do participante para este item (manter ordem de inserção)
    const participantDetails = (details || []).filter(
      (d) => d.userId === userId && d.itemId === itemId,
    );

    if (participantDetails.length === 0) return 'present';

    // Último evento determina estado atual
    const lastEvent = participantDetails[participantDetails.length - 1];
    return lastEvent.action === 'join' ? 'present' : 'absent';
  }
}
