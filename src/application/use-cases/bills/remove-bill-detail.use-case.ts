import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
@Injectable()
export class RemoveBillDetailUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async execute(
    billId: string,
    userId: string,
    itemId: string,
  ): Promise<void> {
    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Verificar se detail existe
    const detailExists = bill.details?.some(
      (d) => d.userId === userId && d.itemId === itemId,
    );
    if (!detailExists) {
      throw new NotFoundException('Detail não encontrado');
    }

    await this.billRepository.removeBillDetail(billId, userId, itemId);
  }
}
