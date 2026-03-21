import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getPagination } from 'src/common/utils/pagination.util';
import { resolveReferenceDate } from 'src/common/utils/date.util';
import { EvaluacionListQueryDto } from './dto/evaluacion-list-query.dto';

@Injectable()
export class EvaluacionesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findOneByRiderId(riderId: number, fechaReferencia?: string) {
    const fecha = resolveReferenceDate(fechaReferencia).toISOString();
    const rows = await this.dataSource.query(
      'SELECT * FROM fn_evaluacion_rider($1::integer, $2::timestamp)',
      [riderId, fecha],
    );

    const item = rows[0];
    if (!item) {
      throw new NotFoundException(`No existe evaluacion para el rider ${riderId}`);
    }

    return item;
  }

  async findAll(query: EvaluacionListQueryDto) {
    const { page, limit, offset } = getPagination(query);
    const fecha = resolveReferenceDate(query.fechaReferencia).toISOString();
    const zona = query.zona ?? null;
    const categoriaActualId = query.categoriaActualId ?? null;
    const categoriaCorrespondienteId = query.categoriaCorrespondienteId ?? null;
    const search = query.search ? `%${query.search}%` : null;

    const totalRows = await this.dataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM riders r
      CROSS JOIN LATERAL fn_evaluacion_rider(r.id, $1::timestamp) ev
      WHERE ($2::varchar IS NULL OR ev.zona = $2)
        AND ($3::int IS NULL OR ev.categoria_actual_id = $3)
        AND ($4::int IS NULL OR ev.categoria_correspondiente_id = $4)
        AND ($5::varchar IS NULL OR ev.nombre ILIKE $5)
      `,
      [fecha, zona, categoriaActualId, categoriaCorrespondienteId, search],
    );

    const items = await this.dataSource.query(
      `
      SELECT *
      FROM (
          SELECT ev.*
          FROM riders r
          CROSS JOIN LATERAL fn_evaluacion_rider(r.id, $1::timestamp) ev
      ) t
      WHERE ($2::varchar IS NULL OR t.zona = $2)
        AND ($3::int IS NULL OR t.categoria_actual_id = $3)
        AND ($4::int IS NULL OR t.categoria_correspondiente_id = $4)
        AND ($5::varchar IS NULL OR t.nombre ILIKE $5)
      ORDER BY t.rider_id ASC
      LIMIT $6 OFFSET $7
      `,
      [fecha, zona, categoriaActualId, categoriaCorrespondienteId, search, limit, offset],
    );

    return {
      items,
      total: Number(totalRows[0]?.total ?? 0),
      page,
      limit,
      fechaReferencia: fecha,
    };
  }
}
