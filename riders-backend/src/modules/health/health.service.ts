import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  getHealth() {
    return {
      success: true,
      message: 'API operativa',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth() {
    const result = await this.dataSource.query('SELECT 1 AS ok');

    return {
      success: true,
      message: 'Base de datos operativa',
      data: result[0],
      timestamp: new Date().toISOString(),
    };
  }
}
