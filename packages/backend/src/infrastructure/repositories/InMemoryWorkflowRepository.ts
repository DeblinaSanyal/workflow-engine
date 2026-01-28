import { Workflow } from '../../domain/entities/Workflow';
import { WorkflowRepository } from '../../domain/repositories/IRepositories';

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private workflows: Map<string, Workflow> = new Map();

  async save(workflow: Workflow): Promise<Workflow> {
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async findById(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    tags?: string[];
  }): Promise<{ workflows: Workflow[]; total: number }> {
    let workflows = Array.from(this.workflows.values());

    // Filter by status
    if (options?.status) {
      workflows = workflows.filter(w => w.status === options.status);
    }

    // Filter by tags
    if (options?.tags && options.tags.length > 0) {
      workflows = workflows.filter(w => 
        options.tags!.some(tag => w.tags.includes(tag))
      );
    }

    const total = workflows.length;

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || workflows.length;
    workflows = workflows.slice(offset, offset + limit);

    return { workflows, total };
  }

  async update(workflow: Workflow): Promise<Workflow> {
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async delete(id: string): Promise<void> {
    this.workflows.delete(id);
  }

  async findByName(name: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w =>
      w.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}
