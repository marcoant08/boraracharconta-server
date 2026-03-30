import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BillItem, BillItemSchema } from './bill-item.schema';
import { Consumption, ConsumptionSchema } from './consumption.schema';
import { Participant, ParticipantSchema } from './participant.schema';
import { BillDetail, BillDetailSchema } from './bill-detail.schema';

export type BillDocument = Bill & Document;

@Schema({ timestamps: true })
export class Bill {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  adminId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: false })
  isPublic: boolean;

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[];

  @Prop({ type: [BillItemSchema], default: [] })
  items: BillItem[];

  @Prop({ type: [ConsumptionSchema], default: [] })
  consumptions: Consumption[];

  @Prop({ type: [BillDetailSchema], default: [] })
  details: BillDetail[];
}

export const BillSchema = SchemaFactory.createForClass(Bill);
