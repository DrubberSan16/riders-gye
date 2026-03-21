import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EvaluacionRiderQueryDto {
  @ApiPropertyOptional({ example: '2026-03-20T00:00:00', description: 'Fecha de referencia para evaluar los ultimos 30 dias.' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
