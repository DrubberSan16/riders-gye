import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TriggerSyncRiderDto {
  @ApiPropertyOptional({ example: '2026-03-20T00:00:00', description: 'Fecha de referencia usada por el procedimiento de sincronizacion.' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
