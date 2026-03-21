import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CategoriaRepository } from './categorias.repository';
import { isUniqueViolation } from 'src/common/utils/db-error.util';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async findAll() {
    const items = await this.categoriaRepository.findAllOrdered();
    return { success: true, data: items };
  }

  async findOne(id: number) {
    const item = await this.categoriaRepository.findByIdOrFail(id);
    return { success: true, data: item };
  }

  async create(dto: CreateCategoriaDto) {
    const exists = await this.categoriaRepository.findByNombre(dto.nombre);
    if (exists) {
      throw new ConflictException(`Ya existe una categoria con nombre ${dto.nombre}`);
    }

    try {
      const entity = this.categoriaRepository.create({
        nombre: dto.nombre,
        entregasMinimas: dto.entregasMinimas,
        calificacionMinima: dto.calificacionMinima,
        comisionPorcentaje: dto.comisionPorcentaje,
      });

      const saved = await this.categoriaRepository.save(entity);
      return { success: true, message: 'Categoria creada correctamente', data: saved };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Ya existe una categoria con nombre ${dto.nombre}`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const entity = await this.categoriaRepository.findByIdOrFail(id);

    if (dto.nombre && dto.nombre !== entity.nombre) {
      const exists = await this.categoriaRepository.findByNombre(dto.nombre);
      if (exists) {
        throw new ConflictException(`Ya existe una categoria con nombre ${dto.nombre}`);
      }
    }

    Object.assign(entity, {
      nombre: dto.nombre ?? entity.nombre,
      entregasMinimas: dto.entregasMinimas ?? entity.entregasMinimas,
      calificacionMinima: dto.calificacionMinima ?? entity.calificacionMinima,
      comisionPorcentaje: dto.comisionPorcentaje ?? entity.comisionPorcentaje,
    });

    const updated = await this.categoriaRepository.save(entity);
    return { success: true, message: 'Categoria actualizada correctamente', data: updated };
  }
}
