import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { resolveReferenceDate } from 'src/common/utils/date.util';
import { TriggerSyncCategoriasDto } from './dto/trigger-sync-categorias.dto';
import { TriggerSyncRiderDto } from './dto/trigger-sync-rider.dto';
import { SyncJobSource, SyncJobStatus } from './interfaces/job-status.interface';

@Injectable()
export class TareasService {
  private readonly logger = new Logger(TareasService.name);
  private readonly jobs = new Map<string, SyncJobStatus>();

  constructor(private readonly dataSource: DataSource) {}

  @Cron(process.env.APP_SYNC_CATEGORIES_CRON ?? '0 10 1 * * *')
  handleNightlySync() {
    this.logger.log('Iniciando sincronizacion programada de categorias');
    this.createJob('all', undefined, undefined, 'cron');
  }

  triggerAll(dto: TriggerSyncCategoriasDto) {
    return this.createJob('all', undefined, dto.fechaReferencia, 'manual');
  }

  triggerSingle(riderId: number, dto: TriggerSyncRiderDto) {
    return this.createJob('single', riderId, dto.fechaReferencia, 'manual');
  }

  getJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`No existe el job ${jobId}`);
    }
    return { success: true, data: job };
  }

  private createJob(
    scope: 'all' | 'single',
    riderId?: number,
    fechaReferencia?: string,
    source: SyncJobSource = 'manual',
  ) {
    const jobId = randomUUID();
    const fecha = resolveReferenceDate(fechaReferencia).toISOString();

    const job: SyncJobStatus = {
      id: jobId,
      status: 'queued',
      source,
      scope,
      riderId,
      fechaReferencia: fecha,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    setTimeout(() => {
      void this.runJob(jobId);
    }, 0);

    return {
      success: true,
      message: 'La sincronizacion fue enviada a ejecucion asincrona en segundo plano',
      data: job,
    };
  }

  private async runJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    job.status = 'running';
    job.startedAt = new Date().toISOString();
    this.jobs.set(jobId, job);

    try {
      if (job.scope === 'all') {
        await this.dataSource.query('CALL sp_sincronizar_todas_categorias($1::timestamp)', [job.fechaReferencia]);
      } else {
        await this.dataSource.query('CALL sp_sincronizar_categoria_rider($1::integer, $2::timestamp)', [job.riderId, job.fechaReferencia]);
      }

      job.status = 'completed';
      job.finishedAt = new Date().toISOString();
      this.jobs.set(jobId, job);
      this.logger.log(`Job ${jobId} completado correctamente`);
    } catch (error) {
      job.status = 'failed';
      job.finishedAt = new Date().toISOString();
      job.error = error instanceof Error ? error.message : 'Error no controlado';
      this.jobs.set(jobId, job);
      this.logger.error(`Job ${jobId} fallo`, job.error);
    }
  }
}
