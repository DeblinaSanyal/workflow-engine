import { DataSource } from 'typeorm';
import { WorkflowEntity } from './entities/WorkflowEntity';
import { WorkflowExecutionEntity } from './entities/WorkflowExecutionEntity';

export const createDataSource = (config?: {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: config?.host || process.env.DB_HOST || 'localhost',
    port: config?.port || Number(process.env.DB_PORT) || 5432,
    username: config?.username || process.env.DB_USERNAME || 'postgres',
    password: config?.password || process.env.DB_PASSWORD || 'postgres',
    database: config?.database || process.env.DB_DATABASE || 'workflow_engine',
    entities: [WorkflowEntity, WorkflowExecutionEntity],
    synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in dev
    logging: process.env.NODE_ENV === 'development',
    migrations: [],
    subscribers: []
  });
};
