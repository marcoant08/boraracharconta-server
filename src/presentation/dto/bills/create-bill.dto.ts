import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({
    description: 'Nome da conta',
    example: 'Jantar no restaurante',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
