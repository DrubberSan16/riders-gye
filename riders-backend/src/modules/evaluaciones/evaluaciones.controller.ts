import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionRiderQueryDto } from './dto/evaluacion-rider-query.dto';
import { EvaluacionListQueryDto } from './dto/evaluacion-list-query.dto';

@ApiTags('Evaluaciones')
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Get('riders')
  @ApiOperation({
    summary: 'Listar evaluaciones de riders',
    description: 'Devuelve la evaluacion calculada de varios riders usando la funcion fn_evaluacion_rider.',
  })
  @ApiOkResponse({ description: 'Listado paginado de evaluaciones.' })
  @ApiQuery({ name: 'zona', required: false, example: 'Norte' })
  @ApiQuery({ name: 'categoriaActualId', required: false, example: 1 })
  @ApiQuery({ name: 'categoriaCorrespondienteId', required: false, example: 2 })
  @ApiQuery({ name: 'search', required: false, example: 'carlos' })
  @ApiQuery({ name: 'fechaReferencia', required: false, example: '2026-03-20T00:00:00' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(@Query() query: EvaluacionListQueryDto) {
    return this.evaluacionesService.findAll(query);
  }

  @Get('riders/:riderId')
  @ApiOperation({
    summary: 'Evaluacion de un rider',
    description: 'Devuelve entregas completadas en 30 dias, promedio, categoria actual, categoria correspondiente y comisiones.',
  })
  @ApiParam({ name: 'riderId', example: 1 })
  @ApiQuery({ name: 'fechaReferencia', required: false, example: '2026-03-20T00:00:00' })
  findOneByRider(
    @Param('riderId', ParseIntPipe) riderId: number,
    @Query() query: EvaluacionRiderQueryDto,
  ) {
    return this.evaluacionesService.findOneByRider(riderId, query);
  }
}
