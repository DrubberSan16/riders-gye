import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { EstadosModule } from './modules/estados/estados.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { RidersModule } from './modules/riders/riders.module';
import { EntregasModule } from './modules/entregas/entregas.module';
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { TareasModule } from './modules/tareas/tareas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'riders_db'),
        ssl: config.get<string>('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: false,
      }),
    }),
    HealthModule,
    EstadosModule,
    CategoriasModule,
    RidersModule,
    EntregasModule,
    EvaluacionesModule,
    ReportesModule,
    TareasModule,
  ],
})
export class AppModule {}
