import { Injectable, Inject, Logger } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillGateway } from '@presentation/gateways/bill.gateway';

@Injectable()
export class BillEventsService {
  private readonly logger = new Logger(BillEventsService.name);

  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly billGateway: BillGateway,
  ) {}

  async emitBillUpdated(billId: string): Promise<void> {
    try {
      const bill = await this.billRepository.findById(billId);
      if (bill) {
        await this.billGateway.emitBillUpdate(billId, bill);
      }
    } catch (error) {
      this.logger.error(`Error emitting bill update for ${billId}:`, error);
    }
  }

  async emitParticipantAdded(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitParticipantRemoved(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitItemAdded(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitItemRemoved(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitConsumptionAdded(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitConsumptionUpdated(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }

  async emitConsumptionRemoved(billId: string): Promise<void> {
    await this.emitBillUpdated(billId);
  }
}
