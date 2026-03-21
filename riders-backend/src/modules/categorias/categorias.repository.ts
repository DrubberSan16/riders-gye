import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriaRepository extends Repository<Categoria> {
  constructor(private readonly dataSource: DataSource) {
    super(Categoria, dataSource.createEntityManager());
  }

  findAllOrdered(): Promise<Categoria[]> {
    return this.find({ order: { entregasMinimas: 'ASC', id: 'ASC' } });
  }

  async findByIdOrFail(id: number): Promise<Categoria> {
    const categoria = await this.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoria con id ${id}`);
    }
    return categoria;
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    return this.findOne({ where: { nombre } });
  }
}
