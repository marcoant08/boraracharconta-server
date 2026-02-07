import { ApiProperty } from '@nestjs/swagger';

export class BillSummaryDto {
  @ApiProperty({ description: 'ID da conta' })
  id: string;

  @ApiProperty({ description: 'Código único da conta' })
  code: string;

  @ApiProperty({ description: 'Nome da conta' })
  name: string;
}
