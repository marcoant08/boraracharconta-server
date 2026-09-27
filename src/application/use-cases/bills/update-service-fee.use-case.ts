import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Bill, ServiceFeeType } from '@domain/entities/bill.entity';

@Injectable()
export class UpdateServiceFeeUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async execute(
    billId: string,
    enabled: boolean,
    type?: ServiceFeeType,
    percent?: number,
    fixedValue?: number,
  ): Promise<Bill> {
    const bill = await this.billRepository.findById(billId);
    if (!bill) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (!enabled) {
      return this.billRepository.updateServiceFee(billId, {
        enabled: false,
        type: null,
        percent: null,
        fixedValue: null,
      });
    }

    if (type !== 'percent' && type !== 'fixed') {
      throw new BadRequestException('Informe se a taxa é percentual ou valor fixo.');
    }

    if (type === 'percent') {
      if (percent === undefined || percent < 10 || percent > 30 || !Number.isInteger(percent)) {
        throw new BadRequestException('O percentual deve ser um inteiro entre 10 e 30.');
      }
      return this.billRepository.updateServiceFee(billId, {
        enabled: true,
        type: 'percent',
        percent,
        fixedValue: null,
      });
    }

    if (fixedValue === undefined || fixedValue <= 0) {
      throw new BadRequestException('Informe um valor fixo maior que zero.');
    }

    return this.billRepository.updateServiceFee(billId, {
      enabled: true,
      type: 'fixed',
      percent: null,
      fixedValue,
    });
  }
}
