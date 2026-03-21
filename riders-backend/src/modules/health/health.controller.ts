import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check general',
    description: 'Verifica que la API este respondiendo.',
  })
  @ApiOkResponse({ description: 'API operativa.' })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('db')
  @ApiOperation({
    summary: 'Health check de base de datos',
    description: 'Ejecuta un SELECT 1 contra PostgreSQL para verificar conectividad.',
  })
  @ApiOkResponse({ description: 'Base de datos operativa.' })
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
