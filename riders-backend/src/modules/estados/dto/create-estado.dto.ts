import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateEstadoDto {
  @ApiProperty({
    example: 'pendiente',
    description: 'Nombre funcional del estado. Se recomienda usar pendiente, en_curso, completada o cancelada.',
  })
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-z_]+$/)
  nombre!: string;
}
