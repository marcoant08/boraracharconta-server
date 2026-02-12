import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class UpdateConsumptionUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    participantId: string,
    itemId: string,
    quantity: number,
  ): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Verificar se consumption existe
    const consumptionExists = bill.consumptions.some(
      (c) => c.participantId === participantId && c.itemId === itemId,
    );

    if (!consumptionExists) {
      throw new NotFoundException('Consumo não encontrado');
    }

    await this.billRepository.updateConsumption(
      billId,
      participantId,
      itemId,
      quantity,
    );

    // Emitir evento WebSocket
    await this.billEventsService.emitConsumptionUpdated(billId, participantId, itemId, quantity);
  }
}
