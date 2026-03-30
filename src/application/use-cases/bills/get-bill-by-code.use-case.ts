import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Bill } from '@domain/entities/bill.entity';

@Injectable()
export class GetBillByCodeUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async execute(code: string): Promise<Bill> {
    const bill = await this.billRepository.findByCode(code);

    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (!bill.isPublic) {
      throw new ForbiddenException('Esta conta não está disponível publicamente');
    }

    return bill;
  }
}
