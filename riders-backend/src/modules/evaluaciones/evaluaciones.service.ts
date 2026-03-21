import { Injectable } from '@nestjs/common';
import { EvaluacionRiderQueryDto } from './dto/evaluacion-rider-query.dto';
import { EvaluacionListQueryDto } from './dto/evaluacion-list-query.dto';
import { EvaluacionesRepository } from './evaluaciones.repository';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly evaluacionesRepository: EvaluacionesRepository) {}

  async findOneByRider(riderId: number, query: EvaluacionRiderQueryDto) {
    const item = await this.evaluacionesRepository.findOneByRiderId(riderId, query.fechaReferencia);
    return { success: true, data: item };
  }

  async findAll(query: EvaluacionListQueryDto) {
    const result = await this.evaluacionesRepository.findAll(query);
    return { success: true, data: result };
  }
}
