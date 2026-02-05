import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinBillDto {
  @ApiProperty({
    description: 'Código da conta (7 caracteres)',
    example: 'ABC1234',
    minLength: 7,
    maxLength: 7,
  })
  @IsString()
  @IsNotEmpty()
  @Length(7, 7)
  code: string;
}
