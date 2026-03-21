import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateRiderDto {
  @ApiProperty({ example: 'Drubber Sanchez' })
  @IsString()
  @Length(3, 120)
  nombre!: string;

  @ApiProperty({ example: 'drubber@mail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '0999999999' })
  @IsString()
  @Length(7, 20)
  telefono!: string;

  @ApiProperty({ example: 'Norte' })
  @IsString()
  @Length(3, 50)
  zona!: string;

  @ApiPropertyOptional({ example: 1, description: 'Categoria del rider. Si no se envia, se asigna Rookie.' })
  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @ApiProperty({ example: '2026-03-20' })
  @IsDateString()
  fechaIngreso!: string;
}
