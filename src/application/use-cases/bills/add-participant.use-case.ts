import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Participant } from '@domain/value-objects/participant.vo';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Injectable()
export class AddParticipantToBillUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billEventsService: BillEventsService,
  ) {}

  async execute(billId: string, name: string): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Para visitantes, userId é igual ao name
    const participant = new Participant(name, name, true, new Date()); // é visitante

    await this.billRepository.addParticipant(billId, participant);

    // Emitir evento WebSocket
    await this.billEventsService.emitParticipantAdded(billId);
  }
}
