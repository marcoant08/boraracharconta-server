import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BillDetail {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  quantityConsumed: number;

  @Prop({ required: true, enum: ['join', 'left'] })
  action: 'join' | 'left';
}

export const BillDetailSchema = SchemaFactory.createForClass(BillDetail);
