import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class UpdateBillDetailUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    userId: string,
    itemId: string,
    consumedDuringAbsence: number,
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
    const participantExists = bill.participants.some(
      (p) => p.userId === userId || p.name === userId,
    );
    if (!participantExists) {
      throw new NotFoundException('Participante não encontrado');
    }

    // Verificar se detail existe
    const detailExists = bill.details?.some(
      (d) => d.userId === userId && d.itemId === itemId,
    );
    if (!detailExists) {
      throw new NotFoundException('Detail não encontrado');
    }

    await this.billRepository.updateBillDetail(
      billId,
      userId,
      itemId,
      consumedDuringAbsence,
    );

    // Emitir evento WebSocket
    await this.billEventsService.emitBillDetailUpdated(
      billId,
      userId,
      itemId,
      consumedDuringAbsence,
    );
  }
}
