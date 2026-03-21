import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CambiarCategoriaRiderDto {
  @ApiProperty({ example: 2, description: 'Nuevo id de categoria para el rider.' })
  @IsInt()
  categoriaId!: number;
}
