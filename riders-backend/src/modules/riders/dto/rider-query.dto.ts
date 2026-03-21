import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class RiderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Norte' })
  @IsOptional()
  @IsString()
  zona?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @ApiPropertyOptional({ example: 'carlos', description: 'Busca por nombre o email.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-03-20T00:00:00', description: 'Fecha de corte para metricas de 30 dias.' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
