import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class EvaluacionListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Norte' })
  @IsOptional()
  @IsString()
  zona?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filtra por categoria actual del rider.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaActualId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filtra por categoria que le corresponderia segun la evaluacion.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaCorrespondienteId?: number;

  @ApiPropertyOptional({ example: 'maria', description: 'Busca por nombre del rider.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-03-20T00:00:00' })
  @IsOptional()
  @IsString()
  fechaReferencia?: string;
}
