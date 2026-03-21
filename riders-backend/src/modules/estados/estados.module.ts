import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from './entities/estado.entity';
import { EstadosController } from './estados.controller';
import { EstadosService } from './estados.service';
import { EstadoRepository } from './estados.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Estado])],
  controllers: [EstadosController],
  providers: [EstadosService, EstadoRepository],
  exports: [EstadosService, EstadoRepository],
})
export class EstadosModule {}
