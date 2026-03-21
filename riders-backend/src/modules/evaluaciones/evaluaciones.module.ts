import { Module } from '@nestjs/common';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesRepository } from './evaluaciones.repository';

@Module({
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService, EvaluacionesRepository],
  exports: [EvaluacionesService, EvaluacionesRepository],
})
export class EvaluacionesModule {}
