import { WorkflowExecution } from '../../domain/entities/WorkflowExecution';
import { WorkflowExecutionRepository } from '../../domain/repositories/IRepositories';

export class InMemoryWorkflowExecutionRepository implements WorkflowExecutionRepository {
  private executions: Map<string, WorkflowExecution> = new Map();

  async save(execution: WorkflowExecution): Promise<WorkflowExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async findById(id: string): Promise<WorkflowExecution | null> {
    return this.executions.get(id) || null;
  }

  async findByWorkflowId(
    workflowId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ executions: WorkflowExecution[]; total: number }> {
    let executions = Array.from(this.executions.values()).filter(
      e => e.workflowId === workflowId
    );

    // Filter by status
    if (options?.status) {
      executions = executions.filter(e => e.status === options.status);
    }

    const total = executions.length;

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || executions.length;
    executions = executions.slice(offset, offset + limit);

    return { executions, total };
  }

  async update(execution: WorkflowExecution): Promise<WorkflowExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async delete(id: string): Promise<void> {
    this.executions.delete(id);
  }

  async findRecent(limit: number): Promise<WorkflowExecution[]> {
    const executions = Array.from(this.executions.values());
    executions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return executions.slice(0, limit);
  }
}
