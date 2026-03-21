export type SyncJobStatusType = 'queued' | 'running' | 'completed' | 'failed';
export type SyncJobSource = 'manual' | 'cron';
export type SyncJobScope = 'all' | 'single';

export interface SyncJobStatus {
  id: string;
  status: SyncJobStatusType;
  source: SyncJobSource;
  scope: SyncJobScope;
  riderId?: number;
  fechaReferencia: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
