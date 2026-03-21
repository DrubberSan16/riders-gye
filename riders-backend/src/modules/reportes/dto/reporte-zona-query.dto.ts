import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReporteZonaQueryDto {
  @ApiPropertyOptional({ example: '2026-03-20T00:00:00', description: 'Fecha de corte para los ultimos 30 dias.' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
