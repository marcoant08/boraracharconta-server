import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Consumption {
  @Prop({ required: true })
  participantId: string;

  @Prop({ required: true })
  itemId: string;

  @Prop({ default: 1 })
  quantity: number;
}

export const ConsumptionSchema = SchemaFactory.createForClass(Consumption);
