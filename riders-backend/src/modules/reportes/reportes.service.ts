import { Injectable } from '@nestjs/common';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { ReporteZonaQueryDto } from './dto/reporte-zona-query.dto';
import { ReportesRepository } from './reportes.repository';

@Injectable()
export class ReportesService {
  constructor(private readonly reportesRepository: ReportesRepository) {}

  async getResumenPorZona(query: ReporteZonaQueryDto) {
    const result = await this.reportesRepository.findResumenPorZona(query.fechaReferencia);
    return { success: true, data: result };
  }

  async getDashboard(query: DashboardQueryDto) {
    const result = await this.reportesRepository.findDashboard(query.fechaReferencia);
    return { success: true, data: result };
  }
}
