import { v4 as uuidv4 } from 'uuid';

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutput?: string;
  targetNodeId: string;
  targetInput?: string;
}

export interface WorkflowSettings {
  executionTimeout?: number;
  errorWorkflow?: string;
  timezone?: string;
}

export interface WorkflowProps {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings?: WorkflowSettings;
  status: WorkflowStatus;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export class Workflow {
  private readonly _id: string;
  private _name: string;
  private _description?: string;
  private _nodes: WorkflowNode[];
  private _connections: WorkflowConnection[];
  private _settings: WorkflowSettings;
  private _status: WorkflowStatus;
  private _tags: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _createdBy?: string;

  constructor(props: WorkflowProps) {
    this._id = props.id || uuidv4();
    this._name = props.name;
    this._description = props.description;
    this._nodes = props.nodes;
    this._connections = props.connections;
    this._settings = props.settings || {};
    this._status = props.status;
    this._tags = props.tags || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._createdBy = props.createdBy;

    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Workflow name cannot be empty');
    }

    if (this._nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Validate connections reference existing nodes
    const nodeIds = new Set(this._nodes.map(n => n.id));
    for (const connection of this._connections) {
      if (!nodeIds.has(connection.sourceNodeId) || !nodeIds.has(connection.targetNodeId)) {
        throw new Error('Connection references non-existent node');
      }
    }

    // Check for circular dependencies
    this.checkCircularDependencies();
  }

  private checkCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = this._connections.filter(c => c.sourceNodeId === nodeId);
      for (const connection of outgoingConnections) {
        if (!visited.has(connection.targetNodeId)) {
          if (hasCycle(connection.targetNodeId)) {
            return true;
          }
        } else if (recursionStack.has(connection.targetNodeId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this._nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error('Workflow contains circular dependencies');
        }
      }
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get nodes(): WorkflowNode[] { return [...this._nodes]; }
  get connections(): WorkflowConnection[] { return [...this._connections]; }
  get settings(): WorkflowSettings { return { ...this._settings }; }
  get status(): WorkflowStatus { return this._status; }
  get tags(): string[] { return [...this._tags]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get createdBy(): string | undefined { return this._createdBy; }

  // Business logic methods
  activate(): void {
    this._status = WorkflowStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = WorkflowStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  markAsError(): void {
    this._status = WorkflowStatus.ERROR;
    this._updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Workflow name cannot be empty');
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  updateNodes(nodes: WorkflowNode[]): void {
    if (nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }
    this._nodes = nodes;
    this._updatedAt = new Date();
    this.validate();
  }

  updateConnections(connections: WorkflowConnection[]): void {
    this._connections = connections;
    this._updatedAt = new Date();
    this.validate();
  }

  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this._tags = this._tags.filter(t => t !== tag);
    this._updatedAt = new Date();
  }

  updateSettings(settings: WorkflowSettings): void {
    this._settings = { ...this._settings, ...settings };
    this._updatedAt = new Date();
  }

  // Get topologically sorted node execution order
  getExecutionOrder(): string[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    // Initialize
    for (const node of this._nodes) {
      inDegree.set(node.id, 0);
      graph.set(node.id, []);
    }

    // Build graph
    for (const connection of this._connections) {
      graph.get(connection.sourceNodeId)!.push(connection.targetNodeId);
      inDegree.set(connection.targetNodeId, inDegree.get(connection.targetNodeId)! + 1);
    }

    // Topological sort (Kahn's algorithm)
    const queue: string[] = [];
    const result: string[] = [];

    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      for (const neighbor of graph.get(nodeId)!) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  toJSON(): WorkflowProps {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      nodes: this._nodes,
      connections: this._connections,
      settings: this._settings,
      status: this._status,
      tags: this._tags,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      createdBy: this._createdBy
    };
  }
}
