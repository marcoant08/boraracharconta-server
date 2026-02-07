import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class RemoveConsumptionUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(
    billId: string,
    participantId: string,
    itemId: string,
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

    await this.billRepository.removeConsumption(billId, participantId, itemId);

    // Emitir evento WebSocket
    await this.billEventsService.emitConsumptionRemoved(billId);
  }
}
