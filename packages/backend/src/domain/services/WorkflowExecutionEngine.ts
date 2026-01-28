import { Workflow } from '../entities/Workflow';
import { WorkflowExecution, ExecutionStatus, ExecutionMode } from '../entities/WorkflowExecution';
import { NodeRegistry, NodeExecutionContext } from '../nodes/BaseNode';

export interface ExecutionLogger {
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: Error) => void;
}

export interface CredentialProvider {
  getCredentials(credentialType: string): Promise<Record<string, any>>;
}

export interface WorkflowExecutionEngineConfig {
  logger: ExecutionLogger;
  credentialProvider?: CredentialProvider;
  executionTimeout?: number;
}

export class WorkflowExecutionEngine {
  private config: WorkflowExecutionEngineConfig;

  constructor(config: WorkflowExecutionEngineConfig) {
    this.config = config;
  }

  /**
   * Execute a workflow and return the execution result
   */
  async execute(
    workflow: Workflow,
    mode: ExecutionMode = ExecutionMode.MANUAL,
    triggerData?: any
  ): Promise<WorkflowExecution> {
    // Create execution record
    const execution = new WorkflowExecution({
      workflowId: workflow.id,
      status: ExecutionStatus.PENDING,
      mode,
      triggerData,
      nodeExecutions: []
    });

    try {
      this.config.logger.info(`Starting workflow execution: ${workflow.id}`, {
        workflowName: workflow.name,
        mode
      });

      // Start execution
      execution.start();

      // Get execution order (topologically sorted)
      const executionOrder = workflow.getExecutionOrder();
      
      this.config.logger.info(`Execution order: ${executionOrder.join(' -> ')}`);

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) {
          throw new Error(`Node not found: ${nodeId}`);
        }

        // Get node implementation
        const nodeImpl = NodeRegistry.get(node.type);
        if (!nodeImpl) {
          throw new Error(`Node type not registered: ${node.type}`);
        }

        // Validate parameters
        nodeImpl.validateParameters(node.parameters);

        // Prepare input data
        const inputData = this.prepareNodeInputData(workflow, execution, nodeId);

        // Create execution context
        const context: NodeExecutionContext = {
          nodeId,
          workflowId: workflow.id,
          executionId: execution.id,
          parameters: node.parameters,
          inputData,
          getPreviousNodeData: (previousNodeId: string) => {
            return execution.getNodeExecutionData(previousNodeId);
          },
          getCredentials: async (credentialType: string) => {
            if (!this.config.credentialProvider) {
              throw new Error('Credential provider not configured');
            }
            return this.config.credentialProvider.getCredentials(credentialType);
          },
          log: {
            info: (message: string, data?: any) => {
              this.config.logger.info(`[${node.name}] ${message}`, data);
            },
            warn: (message: string, data?: any) => {
              this.config.logger.warn(`[${node.name}] ${message}`, data);
            },
            error: (message: string, error?: Error) => {
              this.config.logger.error(`[${node.name}] ${message}`, error);
            }
          }
        };

        // Execute node
        try {
          execution.startNodeExecution(nodeId, node.name);

          this.config.logger.info(`Executing node: ${node.name} (${node.type})`);

          const result = await this.executeWithTimeout(
            nodeImpl.execute(context),
            this.config.executionTimeout || 300000 // 5 minutes default
          );

          if (result.success) {
            execution.completeNodeExecution(nodeId, result.data);
            this.config.logger.info(`Node completed successfully: ${node.name}`);
          } else {
            execution.failNodeExecution(
              nodeId,
              result.error?.message || 'Unknown error',
              result.error?.stack
            );
            throw new Error(result.error?.message || 'Node execution failed');
          }
        } catch (error: any) {
          this.config.logger.error(`Node execution failed: ${node.name}`, error);
          execution.failNodeExecution(nodeId, error.message, error.stack);
          throw error;
        }
      }

      // All nodes completed successfully
      execution.complete();
      this.config.logger.info('Workflow execution completed successfully', {
        executionId: execution.id,
        executionTime: execution.executionTime
      });

      return execution;
    } catch (error: any) {
      this.config.logger.error('Workflow execution failed', error);
      execution.fail(error.message, error.stack);
      return execution;
    }
  }

  /**
   * Prepare input data for a node based on its incoming connections
   */
  private prepareNodeInputData(
    workflow: Workflow,
    execution: WorkflowExecution,
    nodeId: string
  ): Record<string, any> {
    const inputData: Record<string, any> = {};

    // Find all connections targeting this node
    const incomingConnections = workflow.connections.filter(
      c => c.targetNodeId === nodeId
    );

    if (incomingConnections.length === 0) {
      // This is likely a trigger node - use trigger data
      inputData.default = execution.triggerData;
    } else {
      // Get data from connected nodes
      for (const connection of incomingConnections) {
        const sourceData = execution.getNodeExecutionData(connection.sourceNodeId);
        const targetInput = connection.targetInput || 'default';
        
        // Handle output routing (e.g., from conditional nodes)
        if (sourceData?.routeTo && connection.sourceOutput) {
          if (sourceData.routeTo === connection.sourceOutput) {
            inputData[targetInput] = sourceData.value;
          }
        } else {
          inputData[targetInput] = sourceData;
        }
      }
    }

    return inputData;
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
  }

  /**
   * Validate workflow before execution
   */
  static validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all node types are registered
    for (const node of workflow.nodes) {
      if (!NodeRegistry.has(node.type)) {
        errors.push(`Node type not registered: ${node.type} (${node.name})`);
      }
    }

    // Check if workflow has at least one trigger node
    const hasTrigger = workflow.nodes.some(node => {
      const nodeImpl = NodeRegistry.get(node.type);
      return nodeImpl?.metadata.category === 'trigger';
    });

    if (!hasTrigger) {
      errors.push('Workflow must have at least one trigger node');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
