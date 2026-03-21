import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Estado } from './entities/estado.entity';

@Injectable()
export class EstadoRepository extends Repository<Estado> {
  constructor(private readonly dataSource: DataSource) {
    super(Estado, dataSource.createEntityManager());
  }

  findAllOrdered(): Promise<Estado[]> {
    return this.find({ order: { id: 'ASC' } });
  }

  async findByIdOrFail(id: number): Promise<Estado> {
    const estado = await this.findOne({ where: { id } });
    if (!estado) {
      throw new NotFoundException(`No existe el estado con id ${id}`);
    }
    return estado;
  }

  async findByNombre(nombre: string): Promise<Estado | null> {
    return this.findOne({ where: { nombre } });
  }
}
