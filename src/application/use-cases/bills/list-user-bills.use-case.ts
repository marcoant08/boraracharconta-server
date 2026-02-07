import { Injectable, Inject } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Bill } from '@domain/entities/bill.entity';

@Injectable()
export class ListUserBillsUseCase {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async execute(userId: string): Promise<Bill[]> {
    return await this.billRepository.findByUserId(userId);
  }
}
