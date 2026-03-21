import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class EntregaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  riderId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoId?: number;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00' })
  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-03-20T23:59:59' })
  @IsOptional()
  @IsString()
  fechaHasta?: string;

  @ApiPropertyOptional({ example: 'sushi' })
  @IsOptional()
  @IsString()
  search?: string;
}
