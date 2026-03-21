import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entrega } from './entities/entrega.entity';
import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';
import { EntregaRepository } from './entregas.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Entrega])],
  controllers: [EntregasController],
  providers: [EntregasService, EntregaRepository],
  exports: [EntregasService, EntregaRepository],
})
export class EntregasModule {}
