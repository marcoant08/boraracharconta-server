import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddBillDetailDto {
  @ApiProperty({
    description: 'ID do participante (userId ou name)',
    example: 'user-id-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID do item',
    example: 'item-id-456',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'Quantidade de itens consumidos durante a ausência do participante',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  consumedDuringAbsence: number;
}
