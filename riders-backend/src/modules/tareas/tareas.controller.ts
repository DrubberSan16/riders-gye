import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TareasService } from './tareas.service';
import { TriggerSyncCategoriasDto } from './dto/trigger-sync-categorias.dto';
import { TriggerSyncRiderDto } from './dto/trigger-sync-rider.dto';

@ApiTags('Tareas')
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post('sincronizacion-categorias/ejecutar')
  @ApiOperation({
    summary: 'Sincronizar categorias de todos los riders',
    description: 'Lanza una tarea asincrona que ejecuta el procedimiento sp_sincronizar_todas_categorias.',
  })
  @ApiBody({ type: TriggerSyncCategoriasDto })
  triggerAll(@Body() dto: TriggerSyncCategoriasDto) {
    return this.tareasService.triggerAll(dto);
  }

  @Post('sincronizacion-categorias/riders/:riderId/ejecutar')
  @ApiOperation({
    summary: 'Sincronizar categoria de un rider',
    description: 'Lanza una tarea asincrona que ejecuta sp_sincronizar_categoria_rider sobre un rider especifico.',
  })
  @ApiParam({ name: 'riderId', example: 1 })
  @ApiBody({ type: TriggerSyncRiderDto })
  triggerSingle(
    @Param('riderId', ParseIntPipe) riderId: number,
    @Body() dto: TriggerSyncRiderDto,
  ) {
    return this.tareasService.triggerSingle(riderId, dto);
  }

  @Get('jobs/:jobId')
  @ApiOperation({
    summary: 'Consultar estado de tarea',
    description: 'Consulta el estado de una tarea asincrona lanzada manualmente o por cron.',
  })
  @ApiParam({ name: 'jobId', example: 'd3d37642-ae46-4ba0-a7f0-c395d876ce07' })
  getJob(@Param('jobId') jobId: string) {
    return this.tareasService.getJob(jobId);
  }
}
