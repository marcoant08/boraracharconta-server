import { Participant } from '../value-objects/participant.vo';
import { BillItem } from './bill-item.entity';
import { Consumption } from './consumption.entity';
import { BillDetail } from './bill-detail.entity';

export type ServiceFeeType = 'percent' | 'fixed';

export class Bill {
  id: string;
  code: string;
  adminId: string;
  name: string;
  isPublic: boolean;
  participants: Participant[];
  items: BillItem[];
  consumptions: Consumption[];
  details: BillDetail[];
  createdAt: Date;
  updatedAt: Date;
  serviceFeeEnabled: boolean;
  serviceFeeType: ServiceFeeType | null;
  serviceFeePercent: number | null;
  serviceFeeFixedValue: number | null;

  constructor(
    id: string,
    code: string,
    adminId: string,
    name: string,
    isPublic: boolean,
    participants: Participant[],
    items: BillItem[],
    consumptions: Consumption[],
    details: BillDetail[],
    createdAt: Date,
    updatedAt: Date,
    serviceFeeEnabled = false,
    serviceFeeType: ServiceFeeType | null = null,
    serviceFeePercent: number | null = null,
    serviceFeeFixedValue: number | null = null,
  ) {
    this.id = id;
    this.code = code;
    this.adminId = adminId;
    this.name = name;
    this.isPublic = isPublic;
    this.participants = participants;
    this.items = items;
    this.consumptions = consumptions;
    this.details = details;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.serviceFeeEnabled = serviceFeeEnabled;
    this.serviceFeeType = serviceFeeType;
    this.serviceFeePercent = serviceFeePercent;
    this.serviceFeeFixedValue = serviceFeeFixedValue;
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
