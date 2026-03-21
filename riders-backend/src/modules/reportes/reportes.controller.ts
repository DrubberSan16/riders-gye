import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { ReporteZonaQueryDto } from './dto/reporte-zona-query.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('zonas')
  @ApiOperation({
    summary: 'Resumen por zona',
    description: 'Devuelve entregas completadas, comisiones, promedio y conteo de riders por categoria en cada zona.',
  })
  @ApiOkResponse({ description: 'Resumen consolidado por zona.' })
  @ApiQuery({ name: 'fechaReferencia', required: false, example: '2026-03-20T00:00:00' })
  getResumenPorZona(@Query() query: ReporteZonaQueryDto) {
    return this.reportesService.getResumenPorZona(query);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard general',
    description: 'Devuelve tarjetas generales del sistema y distribucion actual de riders por categoria.',
  })
  @ApiOkResponse({ description: 'Metricas generales del dashboard.' })
  @ApiQuery({ name: 'fechaReferencia', required: false, example: '2026-03-20T00:00:00' })
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.reportesService.getDashboard(query);
  }
}
