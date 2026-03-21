import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'estados' })
export class Estado {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'smallint' })
  id?: number;

  @ApiProperty({ example: 'pendiente' })
  @Column({ type: 'varchar', length: 20, unique: true })
  nombre!: string;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt?: Date;

  @ApiProperty({ example: '2026-03-20T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt?: Date;
}
