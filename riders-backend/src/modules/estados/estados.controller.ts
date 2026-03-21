import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { EstadosService } from './estados.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@ApiTags('Estados')
@Controller('estados')
export class EstadosController {
  constructor(private readonly estadosService: EstadosService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estados',
    description: 'Devuelve el catalogo de estados de entrega.',
  })
  @ApiOkResponse({ description: 'Listado de estados.' })
  findAll() {
    return this.estadosService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener estado por id',
    description: 'Devuelve el detalle de un estado especifico.',
  })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadosService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear estado',
    description: 'Crea un nuevo estado del flujo de entregas.',
  })
  @ApiBody({ type: CreateEstadoDto })
  create(@Body() dto: CreateEstadoDto) {
    return this.estadosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar estado',
    description: 'Actualiza el nombre de un estado existente.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateEstadoDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoDto) {
    return this.estadosService.update(id, dto);
  }
}
