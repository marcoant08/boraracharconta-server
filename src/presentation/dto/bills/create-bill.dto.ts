import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({
    description: 'Nome da conta',
    example: 'Jantar no restaurante',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Define se a conta pode ser visualizada publicamente via código',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
