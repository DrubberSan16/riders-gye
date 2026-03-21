import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CambiarEstadoEntregaDto {
  @ApiProperty({
    example: 3,
    description: 'Estado destino. Normalmente 2=en_curso, 3=completada, 4=cancelada.',
  })
  @IsInt()
  estadoId!: number;

  @ApiPropertyOptional({
    example: 4.8,
    description: 'Solo se envia cuando la entrega pasa a completada.',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  calificacion?: number;
}
