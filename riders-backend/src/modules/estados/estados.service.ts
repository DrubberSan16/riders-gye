import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EstadoRepository } from './estados.repository';
import { isUniqueViolation } from 'src/common/utils/db-error.util';

@Injectable()
export class EstadosService {
  constructor(private readonly estadoRepository: EstadoRepository) {}

  async findAll() {
    const items = await this.estadoRepository.findAllOrdered();
    return { success: true, data: items };
  }

  async findOne(id: number) {
    const item = await this.estadoRepository.findByIdOrFail(id);
    return { success: true, data: item };
  }

  async create(dto: CreateEstadoDto) {
    const exists = await this.estadoRepository.findByNombre(dto.nombre);
    if (exists) {
      throw new ConflictException(`Ya existe un estado con nombre ${dto.nombre}`);
    }

    try {
      const entity = this.estadoRepository.create(dto);
      const saved = await this.estadoRepository.save(entity);
      return { success: true, message: 'Estado creado correctamente', data: saved };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Ya existe un estado con nombre ${dto.nombre}`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateEstadoDto) {
    const entity = await this.estadoRepository.findByIdOrFail(id);

    if (dto.nombre && dto.nombre !== entity.nombre) {
      const exists = await this.estadoRepository.findByNombre(dto.nombre);
      if (exists) {
        throw new ConflictException(`Ya existe un estado con nombre ${dto.nombre}`);
      }
    }

    Object.assign(entity, dto);
    const updated = await this.estadoRepository.save(entity);

    return { success: true, message: 'Estado actualizado correctamente', data: updated };
  }
}
