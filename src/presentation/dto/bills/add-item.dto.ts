import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({
    description: 'Nome do item',
    example: 'Pizza Margherita',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Valor unitário do item',
    example: 45.50,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({
    description: 'Quantidade total do item',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Categoria do item',
    example: 'Bebida',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}
