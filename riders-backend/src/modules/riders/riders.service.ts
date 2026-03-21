import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CambiarCategoriaRiderDto } from './dto/cambiar-categoria-rider.dto';
import { RiderQueryDto } from './dto/rider-query.dto';
import { RiderRepository } from './riders.repository';
import { isForeignKeyViolation, isUniqueViolation } from 'src/common/utils/db-error.util';

@Injectable()
export class RidersService {
  constructor(
    private readonly riderRepository: RiderRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: RiderQueryDto) {
    const result = await this.riderRepository.findDashboard(query);
    return { success: true, data: result };
  }

  async findOne(id: number) {
    const rider = await this.riderRepository.findByIdOrFail(id);
    return { success: true, data: rider };
  }

  async create(dto: CreateRiderDto) {
    const emailExists = await this.riderRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException(`Ya existe un rider con email ${dto.email}`);
    }

    const telefonoExists = await this.riderRepository.findByTelefono(dto.telefono);
    if (telefonoExists) {
      throw new ConflictException(`Ya existe un rider con telefono ${dto.telefono}`);
    }

    const categoriaId = dto.categoriaId ?? (await this.resolveCategoriaRookieId());

    try {
      const entity = this.riderRepository.create({
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        zona: dto.zona,
        categoriaId,
        fechaIngreso: dto.fechaIngreso,
      });

      const saved = await this.riderRepository.save(entity);
      return { success: true, message: 'Rider creado correctamente', data: saved };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('El email o telefono ya existen en otro rider');
      }
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException(`La categoria ${categoriaId} no existe`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateRiderDto) {
    const entity = await this.riderRepository.findByIdOrFail(id);

    if (dto.email && dto.email !== entity.email) {
      const existing = await this.riderRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(`Ya existe un rider con email ${dto.email}`);
      }
    }

    if (dto.telefono && dto.telefono !== entity.telefono) {
      const existing = await this.riderRepository.findByTelefono(dto.telefono);
      if (existing) {
        throw new ConflictException(`Ya existe un rider con telefono ${dto.telefono}`);
      }
    }

    Object.assign(entity, {
      nombre: dto.nombre ?? entity.nombre,
      email: dto.email ?? entity.email,
      telefono: dto.telefono ?? entity.telefono,
      zona: dto.zona ?? entity.zona,
      fechaIngreso: dto.fechaIngreso ?? entity.fechaIngreso,
      categoriaId: dto.categoriaId ?? entity.categoriaId,
    });

    try {
      const updated = await this.riderRepository.save(entity);
      return { success: true, message: 'Rider actualizado correctamente', data: updated };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('El email o telefono ya existen en otro rider');
      }
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException(`La categoria ${entity.categoriaId} no existe`);
      }
      throw error;
    }
  }

  async changeCategory(id: number, dto: CambiarCategoriaRiderDto) {
    const entity = await this.riderRepository.findByIdOrFail(id);
    entity.categoriaId = dto.categoriaId;

    try {
      const updated = await this.riderRepository.save(entity);
      return { success: true, message: 'Categoria del rider actualizada correctamente', data: updated };
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException(`La categoria ${dto.categoriaId} no existe`);
      }
      throw error;
    }
  }

  private async resolveCategoriaRookieId(): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT fn_categoria_id('Rookie') AS id`,
    );

    const id = result[0]?.id;
    if (!id) {
      throw new NotFoundException('No existe la categoria Rookie en la base de datos');
    }

    return Number(id);
  }
}
