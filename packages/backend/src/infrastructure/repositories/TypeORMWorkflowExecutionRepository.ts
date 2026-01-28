import { Repository, DataSource } from 'typeorm';
import { WorkflowExecution, WorkflowExecutionProps, ExecutionStatus } from '../../domain/entities/WorkflowExecution';
import { WorkflowExecutionRepository } from '../../domain/repositories/IRepositories';
import { WorkflowExecutionEntity } from '../database/entities/WorkflowExecutionEntity';

export class TypeORMWorkflowExecutionRepository implements WorkflowExecutionRepository {
  private repository: Repository<WorkflowExecutionEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(WorkflowExecutionEntity);
  }

  async save(execution: WorkflowExecution): Promise<WorkflowExecution> {
    const entity = this.toEntity(execution);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<WorkflowExecution | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByWorkflowId(
    workflowId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ executions: WorkflowExecution[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('execution')
      .where('execution.workflowId = :workflowId', { workflowId });

    if (options?.status) {
      query.andWhere('execution.status = :status', { status: options.status });
    }

    const total = await query.getCount();

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    query.orderBy('execution.createdAt', 'DESC');

    const entities = await query.getMany();
    const executions = entities.map(e => this.toDomain(e));

    return { executions, total };
  }

  async update(execution: WorkflowExecution): Promise<WorkflowExecution> {
    const entity = this.toEntity(execution);
    await this.repository.update(entity.id, entity);
    const updated = await this.repository.findOne({ where: { id: entity.id } });
    if (!updated) {
      throw new Error('Execution not found after update');
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findRecent(limit: number): Promise<WorkflowExecution[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit
    });
    return entities.map(e => this.toDomain(e));
  }

  private toDomain(entity: WorkflowExecutionEntity): WorkflowExecution {
    const props: WorkflowExecutionProps = {
      id: entity.id,
      workflowId: entity.workflowId,
      status: entity.status,
      mode: entity.mode,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      executionTime: entity.executionTime,
      nodeExecutions: entity.nodeExecutions,
      triggerData: entity.triggerData,
      errorMessage: entity.errorMessage,
      errorStack: entity.errorStack,
      createdAt: entity.createdAt
    };
    return new WorkflowExecution(props);
  }

  private toEntity(execution: WorkflowExecution): WorkflowExecutionEntity {
    const entity = new WorkflowExecutionEntity();
    const json = execution.toJSON();

    entity.id = json.id!;
    entity.workflowId = json.workflowId;
    entity.status = json.status;
    entity.mode = json.mode;
    entity.startedAt = json.startedAt;
    entity.finishedAt = json.finishedAt;
    entity.executionTime = json.executionTime;
    entity.nodeExecutions = json.nodeExecutions;
    entity.triggerData = json.triggerData;
    entity.errorMessage = json.errorMessage;
    entity.errorStack = json.errorStack;
    entity.createdAt = json.createdAt!;

    return entity;
  }
}
