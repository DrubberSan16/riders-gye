import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { getPagination } from 'src/common/utils/pagination.util';
import { Entrega } from './entities/entrega.entity';
import { EntregaQueryDto } from './dto/entrega-query.dto';

@Injectable()
export class EntregaRepository extends Repository<Entrega> {
  constructor(private readonly dataSource: DataSource) {
    super(Entrega, dataSource.createEntityManager());
  }

  async findByIdOrFail(id: number): Promise<Entrega> {
    const entrega = await this.findOne({ where: { id } });
    if (!entrega) {
      throw new NotFoundException(`No existe la entrega con id ${id}`);
    }
    return entrega;
  }

  async findOneDetail(id: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
          e.id,
          e.rider_id,
          r.nombre AS rider_nombre,
          r.email AS rider_email,
          e.descripcion,
          e.valor::numeric(10,2) AS valor,
          e.estado_id,
          es.nombre AS estado,
          e.calificacion::numeric(3,2) AS calificacion,
          e.fecha_creacion,
          e.fecha_actualizacion
      FROM entregas e
      JOIN riders r ON r.id = e.rider_id
      JOIN estados es ON es.id = e.estado_id
      WHERE e.id = $1
      `,
      [id],
    );

    const entrega = rows[0];
    if (!entrega) {
      throw new NotFoundException(`No existe la entrega con id ${id}`);
    }

    return entrega;
  }

  async findAllDetailed(query: EntregaQueryDto) {
    const { page, limit, offset } = getPagination(query);
    const riderId = query.riderId ?? null;
    const estadoId = query.estadoId ?? null;
    const fechaDesde = query.fechaDesde ?? null;
    const fechaHasta = query.fechaHasta ?? null;
    const search = query.search ? `%${query.search}%` : null;

    const totalRows = await this.dataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM entregas e
      WHERE ($1::int IS NULL OR e.rider_id = $1)
        AND ($2::int IS NULL OR e.estado_id = $2)
        AND ($3::timestamp IS NULL OR e.fecha_creacion >= $3::timestamp)
        AND ($4::timestamp IS NULL OR e.fecha_creacion <= $4::timestamp)
        AND ($5::varchar IS NULL OR e.descripcion ILIKE $5)
      `,
      [riderId, estadoId, fechaDesde, fechaHasta, search],
    );

    const items = await this.dataSource.query(
      `
      SELECT
          e.id,
          e.rider_id,
          r.nombre AS rider_nombre,
          r.email AS rider_email,
          e.descripcion,
          e.valor::numeric(10,2) AS valor,
          e.estado_id,
          es.nombre AS estado,
          e.calificacion::numeric(3,2) AS calificacion,
          e.fecha_creacion,
          e.fecha_actualizacion
      FROM entregas e
      JOIN riders r ON r.id = e.rider_id
      JOIN estados es ON es.id = e.estado_id
      WHERE ($1::int IS NULL OR e.rider_id = $1)
        AND ($2::int IS NULL OR e.estado_id = $2)
        AND ($3::timestamp IS NULL OR e.fecha_creacion >= $3::timestamp)
        AND ($4::timestamp IS NULL OR e.fecha_creacion <= $4::timestamp)
        AND ($5::varchar IS NULL OR e.descripcion ILIKE $5)
      ORDER BY e.fecha_creacion DESC, e.id DESC
      LIMIT $6 OFFSET $7
      `,
      [riderId, estadoId, fechaDesde, fechaHasta, search, limit, offset],
    );

    return {
      items,
      total: Number(totalRows[0]?.total ?? 0),
      page,
      limit,
    };
  }
}
