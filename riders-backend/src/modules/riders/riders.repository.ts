import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { getPagination } from 'src/common/utils/pagination.util';
import { resolveReferenceDate } from 'src/common/utils/date.util';
import { Rider } from './entities/rider.entity';
import { RiderQueryDto } from './dto/rider-query.dto';

@Injectable()
export class RiderRepository extends Repository<Rider> {
  constructor(private readonly dataSource: DataSource) {
    super(Rider, dataSource.createEntityManager());
  }

  async findByIdOrFail(id: number): Promise<Rider> {
    const rider = await this.findOne({
      where: { id },
      relations: { categoria: true },
    });

    if (!rider) {
      throw new NotFoundException(`No existe el rider con id ${id}`);
    }

    return rider;
  }

  async findByEmail(email: string): Promise<Rider | null> {
    return this.findOne({ where: { email } });
  }

  async findByTelefono(telefono: string): Promise<Rider | null> {
    return this.findOne({ where: { telefono } });
  }

  async findDashboard(query: RiderQueryDto) {
    const { page, limit, offset } = getPagination(query);
    const fechaReferencia = resolveReferenceDate(query.fechaReferencia).toISOString();
    const zona = query.zona ?? null;
    const categoriaId = query.categoriaId ?? null;
    const search = query.search ? `%${query.search}%` : null;

    const totalRows = await this.dataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM riders r
      WHERE ($1::varchar IS NULL OR r.zona = $1)
        AND ($2::int IS NULL OR r.categoria_id = $2)
        AND ($3::varchar IS NULL OR r.nombre ILIKE $3 OR r.email ILIKE $3)
      `,
      [zona, categoriaId, search],
    );

    const items = await this.dataSource.query(
      `
      WITH estado_completada AS (
          SELECT fn_estado_id('completada') AS id
      ),
      metricas AS (
          SELECT
              e.rider_id,
              COUNT(*)::int AS entregas_completadas_30_dias,
              ROUND(COALESCE(AVG(e.calificacion), 0), 2)::numeric(10,2) AS calificacion_promedio_30_dias
          FROM entregas e
          CROSS JOIN estado_completada ec
          WHERE e.estado_id = ec.id
            AND e.fecha_creacion >= ($1::timestamp - INTERVAL '30 days')
            AND e.fecha_creacion <= $1::timestamp
          GROUP BY e.rider_id
      )
      SELECT
          r.id,
          r.nombre,
          r.email,
          r.telefono,
          r.zona,
          r.fecha_ingreso,
          c.id AS categoria_actual_id,
          c.nombre AS categoria_actual,
          COALESCE(m.entregas_completadas_30_dias, 0)::int AS entregas_completadas_30_dias,
          COALESCE(m.calificacion_promedio_30_dias, 0)::numeric(10,2) AS calificacion_promedio_30_dias
      FROM riders r
      JOIN categorias c ON c.id = r.categoria_id
      LEFT JOIN metricas m ON m.rider_id = r.id
      WHERE ($2::varchar IS NULL OR r.zona = $2)
        AND ($3::int IS NULL OR r.categoria_id = $3)
        AND ($4::varchar IS NULL OR r.nombre ILIKE $4 OR r.email ILIKE $4)
      ORDER BY r.id ASC
      LIMIT $5 OFFSET $6
      `,
      [fechaReferencia, zona, categoriaId, search, limit, offset],
    );

    return {
      items,
      total: Number(totalRows[0]?.total ?? 0),
      page,
      limit,
      fechaReferencia,
    };
  }
}
