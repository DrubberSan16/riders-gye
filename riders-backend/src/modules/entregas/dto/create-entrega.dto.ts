import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateEntregaDto {
  @ApiProperty({ example: 1, description: 'Id del rider al que se le asigna la entrega.' })
  @IsInt()
  riderId!: number;

  @ApiProperty({ example: 'Pedido de sushi 30 piezas' })
  @IsString()
  @MaxLength(500)
  descripcion!: string;

  @ApiProperty({ example: 18.75 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor!: number;
}
