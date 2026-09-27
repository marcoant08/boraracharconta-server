import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';

export class UpdateServiceFeeDto {
  @ApiProperty({ description: 'Ativa ou desativa a taxa de serviço' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ enum: ['percent', 'fixed'] })
  @ValidateIf((dto: UpdateServiceFeeDto) => dto.enabled)
  @IsIn(['percent', 'fixed'])
  type?: 'percent' | 'fixed';

  @ApiPropertyOptional({ description: 'Percentual inteiro de 10 a 30', example: 10 })
  @ValidateIf((dto: UpdateServiceFeeDto) => dto.enabled && dto.type === 'percent')
  @IsInt()
  @Min(10)
  @Max(30)
  percent?: number;

  @ApiPropertyOptional({ description: 'Valor fixo em reais, dividido igualmente', example: 20 })
  @ValidateIf((dto: UpdateServiceFeeDto) => dto.enabled && dto.type === 'fixed')
  @IsNumber()
  @Min(0.01)
  fixedValue?: number;
}
