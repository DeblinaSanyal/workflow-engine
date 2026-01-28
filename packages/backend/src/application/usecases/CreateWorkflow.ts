import { Workflow, WorkflowProps, WorkflowStatus } from '../../domain/entities/Workflow';
import { WorkflowRepository } from '../../domain/repositories/IRepositories';
import { NodeRegistry } from '../../domain/nodes/BaseNode';

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    parameters: Record<string, any>;
    position: { x: number; y: number };
  }>;
  connections: Array<{
    id: string;
    sourceNodeId: string;
    sourceOutput?: string;
    targetNodeId: string;
    targetInput?: string;
  }>;
  settings?: {
    executionTimeout?: number;
    errorWorkflow?: string;
    timezone?: string;
  };
  tags?: string[];
  createdBy?: string;
}

export class CreateWorkflowUseCase {
  constructor(private workflowRepository: WorkflowRepository) {}

  async execute(dto: CreateWorkflowDTO): Promise<Workflow> {
    // Validate that all node types are registered
    for (const node of dto.nodes) {
      if (!NodeRegistry.has(node.type)) {
        throw new Error(`Unknown node type: ${node.type}`);
      }
    }

    // Create workflow entity
    const workflowProps: WorkflowProps = {
      name: dto.name,
      description: dto.description,
      nodes: dto.nodes,
      connections: dto.connections,
      settings: dto.settings,
      status: WorkflowStatus.INACTIVE,
      tags: dto.tags,
      createdBy: dto.createdBy
    };

    const workflow = new Workflow(workflowProps);

    // Save to repository
    return await this.workflowRepository.save(workflow);
  }
}
