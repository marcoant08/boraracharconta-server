import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class DeleteItemFromBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(billId: string, itemId: string): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    const itemExists = bill.items.some((i) => i.id === itemId);

    if (!itemExists) {
      throw new NotFoundException('Item não encontrado');
    }

    await this.billRepository.removeItem(billId, itemId);

    // Emitir evento WebSocket
    await this.billEventsService.emitItemRemoved(billId, itemId);
  }
}
