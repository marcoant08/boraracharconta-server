import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Participant {
  @Prop()
  userId?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  joinedAt: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
