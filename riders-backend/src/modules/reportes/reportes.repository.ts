import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { resolveReferenceDate } from 'src/common/utils/date.util';

@Injectable()
export class ReportesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findResumenPorZona(fechaReferencia?: string) {
    const fecha = resolveReferenceDate(fechaReferencia).toISOString();
    const items = await this.dataSource.query(
      'SELECT * FROM fn_resumen_zona($1::timestamp)',
      [fecha],
    );

    return { items, fechaReferencia: fecha };
  }

  async findDashboard(fechaReferencia?: string) {
    const fecha = resolveReferenceDate(fechaReferencia).toISOString();

    const [metrics] = await this.dataSource.query(
      `
      WITH estado_ids AS (
          SELECT
              fn_estado_id('pendiente') AS pendiente_id,
              fn_estado_id('en_curso') AS en_curso_id,
              fn_estado_id('completada') AS completada_id,
              fn_estado_id('cancelada') AS cancelada_id
      ),
      entregas_periodo AS (
          SELECT e.*
          FROM entregas e
          WHERE e.fecha_creacion >= ($1::timestamp - INTERVAL '30 days')
            AND e.fecha_creacion <= $1::timestamp
      ),
      completadas_periodo AS (
          SELECT ep.*
          FROM entregas_periodo ep
          CROSS JOIN estado_ids ei
          WHERE ep.estado_id = ei.completada_id
      )
      SELECT
          (SELECT COUNT(*)::int FROM riders) AS total_riders,
          (SELECT COUNT(*)::int FROM entregas e CROSS JOIN estado_ids ei WHERE e.estado_id = ei.pendiente_id) AS entregas_pendientes,
          (SELECT COUNT(*)::int FROM entregas e CROSS JOIN estado_ids ei WHERE e.estado_id = ei.en_curso_id) AS entregas_en_curso,
          (SELECT COUNT(*)::int FROM completadas_periodo) AS entregas_completadas_30_dias,
          (SELECT COALESCE(ROUND(AVG(calificacion), 2), 0)::numeric(10,2) FROM completadas_periodo) AS calificacion_promedio_30_dias,
          (
            SELECT COALESCE(ROUND(SUM(cp.valor * c.comision_porcentaje / 100.0), 2), 0)::numeric(12,2)
            FROM completadas_periodo cp
            JOIN riders r ON r.id = cp.rider_id
            JOIN categorias c ON c.id = r.categoria_id
          ) AS comisiones_generadas_30_dias
      `,
      [fecha],
    );

    const ridersPorCategoriaRows = await this.dataSource.query(
      `
      SELECT c.nombre, COUNT(*)::int AS cantidad
      FROM riders r
      JOIN categorias c ON c.id = r.categoria_id
      GROUP BY c.nombre
      ORDER BY c.entregas_minimas ASC
      `,
    );

    const ridersPorCategoria = ridersPorCategoriaRows.reduce(
      (acc: Record<string, number>, row: { nombre: string; cantidad: number }) => {
        acc[row.nombre] = Number(row.cantidad);
        return acc;
      },
      {},
    );

    return {
      ...metrics,
      riders_por_categoria: ridersPorCategoria,
      fecha_referencia: fecha,
    };
  }
}
