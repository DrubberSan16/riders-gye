import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EntregasService } from './entregas.service';
import { EntregaQueryDto } from './dto/entrega-query.dto';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';
import { CambiarEstadoEntregaDto } from './dto/cambiar-estado-entrega.dto';

@ApiTags('Entregas')
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar entregas',
    description: 'Devuelve entregas con informacion del rider y nombre del estado.',
  })
  @ApiOkResponse({ description: 'Listado paginado de entregas.' })
  @ApiQuery({ name: 'riderId', required: false, example: 1 })
  @ApiQuery({ name: 'estadoId', required: false, example: 3 })
  @ApiQuery({ name: 'fechaDesde', required: false, example: '2026-03-01T00:00:00' })
  @ApiQuery({ name: 'fechaHasta', required: false, example: '2026-03-20T23:59:59' })
  @ApiQuery({ name: 'search', required: false, example: 'pizza' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(@Query() query: EntregaQueryDto) {
    return this.entregasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener entrega por id',
    description: 'Devuelve el detalle completo de una entrega.',
  })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entregasService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear entrega',
    description: 'Crea una nueva entrega. El backend siempre la registra en estado pendiente.',
  })
  @ApiBody({ type: CreateEntregaDto })
  create(@Body() dto: CreateEntregaDto) {
    return this.entregasService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar entrega',
    description: 'Actualiza descripcion o valor de una entrega siempre que no este cerrada.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateEntregaDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntregaDto) {
    return this.entregasService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de entrega',
    description: 'Cambia el estado respetando el flujo pendiente -> en_curso -> completada/cancelada.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: CambiarEstadoEntregaDto })
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoEntregaDto) {
    return this.entregasService.changeStatus(id, dto);
  }
}
