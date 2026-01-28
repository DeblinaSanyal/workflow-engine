import { z } from 'zod';

export interface NodeParameter {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'options' | 'credentials';
  required?: boolean;
  default?: any;
  description?: string;
  options?: Array<{ name: string; value: any }>;
  placeholder?: string;
}

export interface NodeOutput {
  name: string;
  displayName: string;
  type: string;
}

export interface NodeInput {
  name: string;
  displayName: string;
  type: string;
  required?: boolean;
}

export interface NodeMetadata {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  category: 'trigger' | 'action' | 'transform' | 'control' | 'integration';
  version: number;
  parameters: NodeParameter[];
  inputs: NodeInput[];
  outputs: NodeOutput[];
}

export interface NodeExecutionContext {
  nodeId: string;
  workflowId: string;
  executionId: string;
  parameters: Record<string, any>;
  inputData: Record<string, any>;
  getPreviousNodeData: (nodeId: string) => any;
  getCredentials: (credentialType: string) => Promise<Record<string, any>>;
  log: {
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: Error) => void;
  };
}

export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

export abstract class BaseNode {
  abstract readonly metadata: NodeMetadata;

  /**
   * Execute the node logic
   */
  abstract execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;

  /**
   * Validate node parameters
   */
  validateParameters(parameters: Record<string, any>): boolean {
    for (const param of this.metadata.parameters) {
      if (param.required && (parameters[param.name] === undefined || parameters[param.name] === null)) {
        throw new Error(`Required parameter '${param.displayName}' is missing`);
      }

      // Type validation
      if (parameters[param.name] !== undefined) {
        const value = parameters[param.name];
        switch (param.type) {
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Parameter '${param.displayName}' must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Parameter '${param.displayName}' must be a boolean`);
            }
            break;
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Parameter '${param.displayName}' must be a string`);
            }
            break;
          case 'options':
            if (param.options) {
              const validValues = param.options.map(o => o.value);
              if (!validValues.includes(value)) {
                throw new Error(`Parameter '${param.displayName}' must be one of: ${validValues.join(', ')}`);
              }
            }
            break;
        }
      }
    }
    return true;
  }

  /**
   * Get parameter with default value if not provided
   */
  protected getParameter<T = any>(context: NodeExecutionContext, paramName: string): T {
    const param = this.metadata.parameters.find(p => p.name === paramName);
    if (!param) {
      throw new Error(`Parameter '${paramName}' not found in node metadata`);
    }

    const value = context.parameters[paramName];
    return value !== undefined ? value : param.default;
  }

  /**
   * Helper to create successful result
   */
  protected success(data?: any): NodeExecutionResult {
    return { success: true, data };
  }

  /**
   * Helper to create error result
   */
  protected error(message: string, error?: Error): NodeExecutionResult {
    return {
      success: false,
      error: {
        message,
        stack: error?.stack
      }
    };
  }
}

/**
 * Node Registry - Manages all available node types
 */
export class NodeRegistry {
  private static nodes = new Map<string, BaseNode>();

  static register(node: BaseNode): void {
    if (this.nodes.has(node.metadata.name)) {
      throw new Error(`Node '${node.metadata.name}' is already registered`);
    }
    this.nodes.set(node.metadata.name, node);
  }

  static get(nodeName: string): BaseNode | undefined {
    return this.nodes.get(nodeName);
  }

  static getAll(): BaseNode[] {
    return Array.from(this.nodes.values());
  }

  static getAllMetadata(): NodeMetadata[] {
    return Array.from(this.nodes.values()).map(node => node.metadata);
  }

  static has(nodeName: string): boolean {
    return this.nodes.has(nodeName);
  }

  static clear(): void {
    this.nodes.clear();
  }
}
