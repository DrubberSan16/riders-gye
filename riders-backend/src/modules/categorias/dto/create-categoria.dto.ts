import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Semi-Pro' })
  @IsString()
  @Length(3, 30)
  nombre!: string;

  @ApiProperty({ example: 50, description: 'Cantidad minima de entregas completadas para calificar a la categoria.' })
  @IsNumber()
  @Min(0)
  entregasMinimas!: number;

  @ApiProperty({ example: 3.5, description: 'Calificacion promedio minima requerida.' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  calificacionMinima!: number;

  @ApiProperty({ example: 8.5, description: 'Porcentaje de comision aplicado al rider.' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  comisionPorcentaje!: number;
}
