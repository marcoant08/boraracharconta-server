import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({
    description: 'Nome do participante visitante',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
