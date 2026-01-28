import { Workflow } from '../entities/Workflow';
import { WorkflowExecution } from '../entities/WorkflowExecution';

export interface WorkflowRepository {
  save(workflow: Workflow): Promise<Workflow>;
  findById(id: string): Promise<Workflow | null>;
  findAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    tags?: string[];
  }): Promise<{ workflows: Workflow[]; total: number }>;
  update(workflow: Workflow): Promise<Workflow>;
  delete(id: string): Promise<void>;
  findByName(name: string): Promise<Workflow[]>;
}

export interface WorkflowExecutionRepository {
  save(execution: WorkflowExecution): Promise<WorkflowExecution>;
  findById(id: string): Promise<WorkflowExecution | null>;
  findByWorkflowId(workflowId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ executions: WorkflowExecution[]; total: number }>;
  update(execution: WorkflowExecution): Promise<WorkflowExecution>;
  delete(id: string): Promise<void>;
  findRecent(limit: number): Promise<WorkflowExecution[]>;
}
