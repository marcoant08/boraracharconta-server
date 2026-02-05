import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateConsumptionDto {
  @ApiProperty({
    description: 'ID do participante',
    example: 'user-id-123',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({
    description: 'ID do item',
    example: 'item-id-456',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'Nova quantidade consumida',
    example: 3,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
