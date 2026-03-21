import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RidersService } from './riders.service';
import { RiderQueryDto } from './dto/rider-query.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CambiarCategoriaRiderDto } from './dto/cambiar-categoria-rider.dto';

@ApiTags('Riders')
@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar riders',
    description: 'Devuelve riders con categoria actual, entregas completadas en 30 dias y calificacion promedio.',
  })
  @ApiOkResponse({ description: 'Listado paginado de riders.' })
  @ApiQuery({ name: 'zona', required: false, example: 'Norte' })
  @ApiQuery({ name: 'categoriaId', required: false, example: 2 })
  @ApiQuery({ name: 'search', required: false, example: 'carlos' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'fechaReferencia', required: false, example: '2026-03-20T00:00:00' })
  findAll(@Query() query: RiderQueryDto) {
    return this.ridersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener rider por id',
    description: 'Devuelve el detalle completo del rider con su categoria actual.',
  })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ridersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear rider',
    description: 'Registra un rider nuevo. Si no se envia categoriaId, el backend asigna Rookie por defecto.',
  })
  @ApiBody({ type: CreateRiderDto })
  create(@Body() dto: CreateRiderDto) {
    return this.ridersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar rider',
    description: 'Actualiza los datos basicos del rider.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateRiderDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRiderDto) {
    return this.ridersService.update(id, dto);
  }

  @Patch(':id/categoria')
  @ApiOperation({
    summary: 'Cambiar categoria de rider',
    description: 'Permite reasignar manualmente la categoria actual del rider.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: CambiarCategoriaRiderDto })
  changeCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarCategoriaRiderDto) {
    return this.ridersService.changeCategory(id, dto);
  }
}
