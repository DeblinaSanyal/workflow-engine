import { WorkflowRepository, WorkflowExecutionRepository } from '../../domain/repositories/IRepositories';
import { WorkflowExecutionEngine } from '../../domain/services/WorkflowExecutionEngine';
import { WorkflowExecution, ExecutionMode } from '../../domain/entities/WorkflowExecution';

export interface ExecuteWorkflowDTO {
  workflowId: string;
  mode?: ExecutionMode;
  triggerData?: any;
}

export class ExecuteWorkflowUseCase {
  constructor(
    private workflowRepository: WorkflowRepository,
    private executionRepository: WorkflowExecutionRepository,
    private executionEngine: WorkflowExecutionEngine
  ) {}

  async execute(dto: ExecuteWorkflowDTO): Promise<WorkflowExecution> {
    // Get workflow
    const workflow = await this.workflowRepository.findById(dto.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${dto.workflowId}`);
    }

    // Validate workflow
    const validation = WorkflowExecutionEngine.validateWorkflow(workflow);
    if (!validation.valid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    // Execute workflow
    const execution = await this.executionEngine.execute(
      workflow,
      dto.mode || ExecutionMode.MANUAL,
      dto.triggerData
    );

    // Save execution
    const savedExecution = await this.executionRepository.save(execution);

    return savedExecution;
  }
}
