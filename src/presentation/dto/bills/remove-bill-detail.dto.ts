import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveBillDetailDto {
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
}
