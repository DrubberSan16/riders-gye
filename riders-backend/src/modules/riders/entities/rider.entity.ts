import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categoria } from 'src/modules/categorias/entities/categoria.entity';
import { Entrega } from 'src/modules/entregas/entities/entrega.entity';

@Entity({ name: 'riders' })
export class Rider {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'integer' })
  id?: number;

  @ApiProperty({ example: 'Carlos Mendez' })
  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @ApiProperty({ example: 'carlos.mendez@mail.com' })
  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @ApiProperty({ example: '0991234567' })
  @Column({ type: 'varchar', length: 20, unique: true })
  telefono!: string;

  @ApiProperty({ example: 'Norte' })
  @Column({ type: 'varchar', length: 50 })
  zona!: string;

  @ApiProperty({ example: 1 })
  @Column({ name: 'categoria_id', type: 'integer' })
  categoriaId!: number;

  @ManyToOne(() => Categoria, { eager: false, nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  categoria?: Categoria;

  @OneToMany(() => Entrega, (entrega) => entrega.rider)
  entregas?: Entrega[];

  @ApiProperty({ example: '2024-06-15' })
  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso!: string;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt?: Date;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt?: Date;
}
