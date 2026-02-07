import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { Consumption } from '../entities/consumption.entity';
import { Participant } from '../value-objects/participant.vo';

export interface IBillRepository {
  create(bill: Bill): Promise<Bill>;
  findById(id: string): Promise<Bill | null>;
  findByCode(code: string): Promise<Bill | null>;
  findByUserId(userId: string): Promise<Bill[]>;
  update(bill: Bill): Promise<Bill>;
  delete(id: string): Promise<void>;

  // operações em arrays embutidos
  addItem(billId: string, item: BillItem): Promise<void>;
  removeItem(billId: string, itemId: string): Promise<void>;
  addConsumption(billId: string, consumption: Consumption): Promise<void>;
  updateConsumption(
    billId: string,
    participantId: string,
    itemId: string,
    quantity: number,
  ): Promise<void>;
  removeConsumption(
    billId: string,
    participantId: string,
    itemId: string,
  ): Promise<void>;
  addParticipant(billId: string, participant: Participant): Promise<void>;
  removeParticipant(billId: string, participantId: string): Promise<void>;
}
