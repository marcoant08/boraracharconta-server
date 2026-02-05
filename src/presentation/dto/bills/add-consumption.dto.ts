import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddConsumptionDto {
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
    description: 'Quantidade consumida (opcional, padrão 1)',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;
}
