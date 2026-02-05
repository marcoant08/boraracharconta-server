import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BillItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  category: string;
}

export const BillItemSchema = SchemaFactory.createForClass(BillItem);
