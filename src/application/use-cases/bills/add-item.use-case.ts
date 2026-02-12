import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillItem } from '@domain/entities/bill-item.entity';
import { BillEventsService } from '@infrastructure/services/bill-events.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AddItemToBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    name: string,
    value: number,
    quantity: number,
    category: string,
  ): Promise<BillItem> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    const item = new BillItem(
      randomUUID(),
      name,
      value,
      quantity,
      category,
    );

    await this.billRepository.addItem(billId, item);

    // Emitir evento WebSocket
    await this.billEventsService.emitItemAdded(billId, item);

    return item;
  }
}
