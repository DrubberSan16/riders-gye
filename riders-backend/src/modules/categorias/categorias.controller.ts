import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@ApiTags('Categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar categorias',
    description: 'Devuelve todas las categorias de riders y sus reglas de negocio.',
  })
  @ApiOkResponse({ description: 'Listado de categorias.' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener categoria por id',
    description: 'Devuelve el detalle de una categoria especifica.',
  })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear categoria',
    description: 'Crea una categoria nueva con sus requisitos y porcentaje de comision.',
  })
  @ApiBody({ type: CreateCategoriaDto })
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar categoria',
    description: 'Actualiza las reglas o el nombre de una categoria existente.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateCategoriaDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.categoriasService.update(id, dto);
  }
}
