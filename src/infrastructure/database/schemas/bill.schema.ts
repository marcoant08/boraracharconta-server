import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BillItem, BillItemSchema } from './bill-item.schema';
import { Consumption, ConsumptionSchema } from './consumption.schema';
import { Participant, ParticipantSchema } from './participant.schema';

export type BillDocument = Bill & Document;

@Schema({ timestamps: true })
export class Bill {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  adminId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[];

  @Prop({ type: [BillItemSchema], default: [] })
  items: BillItem[];

  @Prop({ type: [ConsumptionSchema], default: [] })
  consumptions: Consumption[];
}

export const BillSchema = SchemaFactory.createForClass(Bill);
