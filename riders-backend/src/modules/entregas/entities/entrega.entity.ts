import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rider } from 'src/modules/riders/entities/rider.entity';
import { Estado } from 'src/modules/estados/entities/estado.entity';
import { numericTransformer } from 'src/common/transformers/numeric.transformer';

@Entity({ name: 'entregas' })
export class Entrega {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id?: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'rider_id', type: 'integer' })
  riderId!: number;

  @ManyToOne(() => Rider, (rider) => rider.entregas, { eager: false, nullable: false })
  @JoinColumn({ name: 'rider_id' })
  rider?: Rider;

  @ApiProperty({ example: 'Combo familiar pollo' })
  @Column({ type: 'text' })
  descripcion!: string;

  @ApiProperty({ example: 25.5 })
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  valor!: number;

  @ApiProperty({ example: 3 })
  @Column({ name: 'estado_id', type: 'smallint' })
  estadoId!: number;

  @ManyToOne(() => Estado, { eager: false, nullable: false })
  @JoinColumn({ name: 'estado_id' })
  estado?: Estado;

  @ApiPropertyOptional({ example: 4.8, nullable: true })
  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true, transformer: numericTransformer })
  calificacion?: number | null;

  @ApiProperty({ example: '2026-03-20T12:00:00' })
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion?: Date;

  @ApiProperty({ example: '2026-03-20T12:00:00' })
  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'timestamp' })
  fechaActualizacion?: Date;
}
