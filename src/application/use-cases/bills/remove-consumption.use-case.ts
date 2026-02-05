import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';

@Injectable()
export class RemoveConsumptionUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
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
  }
}
