import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';
import { CambiarEstadoEntregaDto } from './dto/cambiar-estado-entrega.dto';
import { EntregaQueryDto } from './dto/entrega-query.dto';
import { EntregaRepository } from './entregas.repository';
import { isForeignKeyViolation } from 'src/common/utils/db-error.util';

@Injectable()
export class EntregasService {
  constructor(
    private readonly entregaRepository: EntregaRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: EntregaQueryDto) {
    const result = await this.entregaRepository.findAllDetailed(query);
    return { success: true, data: result };
  }

  async findOne(id: number) {
    const item = await this.entregaRepository.findOneDetail(id);
    return { success: true, data: item };
  }

  async create(dto: CreateEntregaDto) {
    await this.ensureRiderExists(dto.riderId);
    const estadoPendienteId = await this.resolveEstadoId('pendiente');

    try {
      const entity = this.entregaRepository.create({
        riderId: dto.riderId,
        descripcion: dto.descripcion,
        valor: dto.valor,
        estadoId: estadoPendienteId,
        calificacion: null,
      });

      const saved = await this.entregaRepository.save(entity);
      return {
        success: true,
        message: 'Entrega creada correctamente en estado pendiente',
        data: await this.entregaRepository.findOneDetail(saved.id!),
      };
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException('No existe el rider o el estado configurado para la entrega');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateEntregaDto) {
    const entity = await this.entregaRepository.findByIdOrFail(id);
    const detail = await this.entregaRepository.findOneDetail(id);

    if (['completada', 'cancelada'].includes(detail.estado)) {
      throw new BadRequestException(`No se puede editar una entrega en estado ${detail.estado}`);
    }

    entity.descripcion = dto.descripcion ?? entity.descripcion;
    entity.valor = dto.valor ?? entity.valor;

    const saved = await this.entregaRepository.save(entity);
    return {
      success: true,
      message: 'Entrega actualizada correctamente',
      data: await this.entregaRepository.findOneDetail(saved.id!),
    };
  }

  async changeStatus(id: number, dto: CambiarEstadoEntregaDto) {
    const entity = await this.entregaRepository.findByIdOrFail(id);
    const detail = await this.entregaRepository.findOneDetail(id);

    if (['completada', 'cancelada'].includes(detail.estado)) {
      throw new BadRequestException(`No se puede modificar una entrega en estado ${detail.estado}`);
    }

    const estadoDestino = await this.resolveEstadoNombre(dto.estadoId);

    if (!estadoDestino) {
      throw new NotFoundException(`No existe el estado destino con id ${dto.estadoId}`);
    }

    if (estadoDestino === 'completada' && dto.calificacion == null) {
      throw new BadRequestException('La calificacion es obligatoria para completar una entrega');
    }

    if (estadoDestino !== 'completada' && dto.calificacion != null) {
      throw new BadRequestException('La calificacion solo se registra cuando la entrega se completa');
    }

    entity.estadoId = dto.estadoId;
    entity.calificacion = dto.calificacion ?? null;

    const saved = await this.entregaRepository.save(entity);
    return {
      success: true,
      message: 'Estado de entrega actualizado correctamente',
      data: await this.entregaRepository.findOneDetail(saved.id!),
    };
  }

  private async ensureRiderExists(riderId: number) {
    const result = await this.dataSource.query('SELECT id FROM riders WHERE id = $1', [riderId]);
    if (!result[0]) {
      throw new NotFoundException(`No existe el rider con id ${riderId}`);
    }
  }

  private async resolveEstadoId(nombre: string): Promise<number> {
    const result = await this.dataSource.query('SELECT fn_estado_id($1) AS id', [nombre]);
    const id = result[0]?.id;
    if (!id) {
      throw new NotFoundException(`No existe el estado ${nombre}`);
    }
    return Number(id);
  }

  private async resolveEstadoNombre(id: number): Promise<string | null> {
    const result = await this.dataSource.query('SELECT fn_estado_nombre($1) AS nombre', [id]);
    return result[0]?.nombre ?? null;
  }
}
