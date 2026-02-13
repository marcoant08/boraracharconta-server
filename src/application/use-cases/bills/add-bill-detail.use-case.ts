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

    // Verificar se já existe um detail com os mesmos userId e itemId
    const detailExists = bill.details?.some(
      (d) => d.userId === userId && d.itemId === itemId,
    );
    if (detailExists) {
      throw new BadRequestException(
        'Já existe um detail para este participante e item. Use a atualização para modificar a quantidade.',
      );
    }

    const detail = new BillDetail(userId, itemId, consumedDuringAbsence);

    await this.billRepository.addBillDetail(billId, detail);

    // Emitir evento WebSocket
    await this.billEventsService.emitBillDetailAdded(billId, detail);
  }
}
