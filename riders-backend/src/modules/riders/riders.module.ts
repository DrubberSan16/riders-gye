import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from './entities/rider.entity';
import { RidersController } from './riders.controller';
import { RidersService } from './riders.service';
import { RiderRepository } from './riders.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Rider])],
  controllers: [RidersController],
  providers: [RidersService, RiderRepository],
  exports: [RidersService, RiderRepository],
})
export class RidersModule {}
