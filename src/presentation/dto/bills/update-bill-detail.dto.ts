import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsEnum } from 'class-validator';

export class UpdateBillDetailDto {
  @ApiProperty({
    description: 'ID do item',
    example: 'item-id-456',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'ID do participante (userId ou name)',
    example: 'user-id-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Nova quantidade de itens consumidos nesse evento',
    example: 3,
  })
  @IsNumber()
  @Min(1)
  quantityConsumed: number;

  @ApiProperty({
    description: 'Ação do participante: entrar (join) ou sair (left) da mesa',
    example: 'join',
    enum: ['join', 'left'],
  })
  @IsEnum(['join', 'left'])
  @IsNotEmpty()
  action: 'join' | 'left';
}
