import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BillDetail {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  consumedDuringAbsence: number;
}

export const BillDetailSchema = SchemaFactory.createForClass(BillDetail);
