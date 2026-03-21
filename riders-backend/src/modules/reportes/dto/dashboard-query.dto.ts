import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: '2026-03-20T00:00:00' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
