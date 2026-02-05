import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Consumption } from '@domain/entities/consumption.entity';

@Injectable()
export class AddConsumptionUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async execute(
    billId: string,
    participantId: string,
    itemId: string,
    quantity?: number,
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
      (p) => p.userId === participantId || p.name === participantId,
    );
    if (!participantExists) {
      throw new NotFoundException('Participante não encontrado');
    }

    const consumption = new Consumption(participantId, itemId, quantity);

    await this.billRepository.addConsumption(billId, consumption);
  }
}
