import { Repository, DataSource } from 'typeorm';
import { Workflow, WorkflowProps, WorkflowStatus } from '../../domain/entities/Workflow';
import { WorkflowRepository } from '../../domain/repositories/IRepositories';
import { WorkflowEntity } from '../database/entities/WorkflowEntity';

export class TypeORMWorkflowRepository implements WorkflowRepository {
  private repository: Repository<WorkflowEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(WorkflowEntity);
  }

  async save(workflow: Workflow): Promise<Workflow> {
    const entity = this.toEntity(workflow);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Workflow | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    tags?: string[];
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const query = this.repository.createQueryBuilder('workflow');

    if (options?.status) {
      query.andWhere('workflow.status = :status', { status: options.status });
    }

    if (options?.tags && options.tags.length > 0) {
      query.andWhere('workflow.tags && :tags', { tags: options.tags });
    }

    const total = await query.getCount();

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    query.orderBy('workflow.updatedAt', 'DESC');

    const entities = await query.getMany();
    const workflows = entities.map(e => this.toDomain(e));

    return { workflows, total };
  }

  async update(workflow: Workflow): Promise<Workflow> {
    const entity = this.toEntity(workflow);
    await this.repository.update(entity.id, entity);
    const updated = await this.repository.findOne({ where: { id: entity.id } });
    if (!updated) {
      throw new Error('Workflow not found after update');
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByName(name: string): Promise<Workflow[]> {
    const entities = await this.repository
      .createQueryBuilder('workflow')
      .where('workflow.name ILIKE :name', { name: `%${name}%` })
      .getMany();
    
    return entities.map(e => this.toDomain(e));
  }

  private toDomain(entity: WorkflowEntity): Workflow {
    const props: WorkflowProps = {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      nodes: entity.nodes,
      connections: entity.connections,
      settings: entity.settings,
      status: entity.status,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy
    };
    return new Workflow(props);
  }

  private toEntity(workflow: Workflow): WorkflowEntity {
    const entity = new WorkflowEntity();
    const json = workflow.toJSON();
    
    entity.id = json.id!;
    entity.name = json.name;
    entity.description = json.description;
    entity.nodes = json.nodes;
    entity.connections = json.connections;
    entity.settings = json.settings || {};
    entity.status = json.status;
    entity.tags = json.tags;
    entity.createdAt = json.createdAt!;
    entity.updatedAt = json.updatedAt!;
    entity.createdBy = json.createdBy;

    return entity;
  }
}
