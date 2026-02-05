import { ApiProperty } from '@nestjs/swagger';

class ParticipantDto {
  @ApiProperty()
  userId?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  joinedAt: Date;
}

class BillItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  category: string;
}

class ConsumptionDto {
  @ApiProperty()
  participantId: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty({ required: false })
  quantity?: number;
}

export class BillResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [ParticipantDto] })
  participants: ParticipantDto[];

  @ApiProperty({ type: [BillItemDto] })
  items: BillItemDto[];

  @ApiProperty({ type: [ConsumptionDto] })
  consumptions: ConsumptionDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
