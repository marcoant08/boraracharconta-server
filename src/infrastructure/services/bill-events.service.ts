import { Injectable, Inject, Logger } from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { BillGateway } from '@presentation/gateways/bill.gateway';
import { BillItem } from '@domain/entities/bill-item.entity';
import { Participant } from '@domain/value-objects/participant.vo';
import { Consumption } from '@domain/entities/consumption.entity';
import { BillDetail } from '@domain/entities/bill-detail.entity';

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

  async emitItemAdded(billId: string, item: BillItem): Promise<void> {
    this.billGateway.emitItemAdded(billId, {
      id: item.id,
      name: item.name,
      value: item.value,
      quantity: item.quantity,
      category: item.category,
    });
  }

  async emitItemRemoved(billId: string, itemId: string): Promise<void> {
    this.billGateway.emitItemRemoved(billId, itemId);
  }

  async emitParticipantAdded(billId: string, participant: Participant): Promise<void> {
    this.billGateway.emitParticipantAdded(billId, {
      userId: participant.userId,
      name: participant.name,
      isVisitor: participant.isVisitor,
      joinedAt: participant.joinedAt,
    });
  }

  async emitParticipantRemoved(billId: string, participantId: string): Promise<void> {
    this.billGateway.emitParticipantRemoved(billId, participantId);
  }

  async emitConsumptionAdded(billId: string, consumption: Consumption): Promise<void> {
    this.billGateway.emitConsumptionAdded(billId, {
      participantId: consumption.participantId,
      itemId: consumption.itemId,
      quantity: consumption.quantity,
    });
  }

  async emitConsumptionUpdated(billId: string, participantId: string, itemId: string, quantity: number): Promise<void> {
    this.billGateway.emitConsumptionUpdated(billId, {
      participantId,
      itemId,
      quantity,
    });
  }

  async emitConsumptionRemoved(billId: string, participantId: string, itemId: string): Promise<void> {
    this.billGateway.emitConsumptionRemoved(billId, participantId, itemId);
  }

  async emitBillDetailAdded(billId: string, detail: BillDetail): Promise<void> {
    this.billGateway.emitBillDetailAdded(billId, {
      userId: detail.userId,
      itemId: detail.itemId,
      consumedDuringAbsence: detail.consumedDuringAbsence,
    });
  }

  async emitBillDetailUpdated(billId: string, userId: string, itemId: string, consumedDuringAbsence: number): Promise<void> {
    this.billGateway.emitBillDetailUpdated(billId, {
      userId,
      itemId,
      consumedDuringAbsence,
    });
  }

  async emitBillDetailRemoved(billId: string, userId: string, itemId: string): Promise<void> {
    this.billGateway.emitBillDetailRemoved(billId, userId, itemId);
  }
}
