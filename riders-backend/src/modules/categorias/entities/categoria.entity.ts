import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { numericTransformer } from 'src/common/transformers/numeric.transformer';

@Entity({ name: 'categorias' })
export class Categoria {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'integer' })
  id?: number;

  @ApiProperty({ example: 'Rookie' })
  @Column({ type: 'varchar', length: 30, unique: true })
  nombre!: string;

  @ApiProperty({ example: 0 })
  @Column({ name: 'entregas_minimas', type: 'integer' })
  entregasMinimas!: number;

  @ApiProperty({ example: 3.5 })
  @Column({ name: 'calificacion_minima', type: 'numeric', precision: 3, scale: 2, transformer: numericTransformer })
  calificacionMinima!: number;

  @ApiProperty({ example: 8.5 })
  @Column({ name: 'comision_porcentaje', type: 'numeric', precision: 5, scale: 2, transformer: numericTransformer })
  comisionPorcentaje!: number;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt?: Date;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt?: Date;
}
