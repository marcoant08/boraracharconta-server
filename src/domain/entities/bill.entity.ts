import { Participant } from '../value-objects/participant.vo';
import { BillItem } from './bill-item.entity';
import { Consumption } from './consumption.entity';
import { BillDetail } from './bill-detail.entity';

export class Bill {
  id: string;
  code: string;
  adminId: string;
  name: string;
  participants: Participant[];
  items: BillItem[];
  consumptions: Consumption[];
  details: BillDetail[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    code: string,
    adminId: string,
    name: string,
    participants: Participant[],
    items: BillItem[],
    consumptions: Consumption[],
    details: BillDetail[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.code = code;
    this.adminId = adminId;
    this.name = name;
    this.participants = participants;
    this.items = items;
    this.consumptions = consumptions;
    this.details = details;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isAdmin(userId: string): boolean {
    return this.adminId === userId;
  }

  isParticipant(userId: string): boolean {
    return this.participants.some((p) => p.userId === userId);
  }

  isVerifiedParticipant(userId: string): boolean {
    return this.participants.some(
      (p) => p.userId === userId && !p.isVisitor,
    );
  }
}
