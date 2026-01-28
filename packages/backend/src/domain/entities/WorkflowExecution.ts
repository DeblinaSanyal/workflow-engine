import { v4 as uuidv4 } from 'uuid';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
  WAITING = 'WAITING'
}

export enum ExecutionMode {
  MANUAL = 'MANUAL',
  TRIGGER = 'TRIGGER',
  SCHEDULED = 'SCHEDULED',
  WEBHOOK = 'WEBHOOK'
}

export interface NodeExecutionData {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startedAt?: Date;
  finishedAt?: Date;
  executionTime?: number;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface WorkflowExecutionProps {
  id?: string;
  workflowId: string;
  status: ExecutionStatus;
  mode: ExecutionMode;
  startedAt?: Date;
  finishedAt?: Date;
  executionTime?: number;
  nodeExecutions: NodeExecutionData[];
  triggerData?: any;
  errorMessage?: string;
  errorStack?: string;
  createdAt?: Date;
}

export class WorkflowExecution {
  private readonly _id: string;
  private readonly _workflowId: string;
  private _status: ExecutionStatus;
  private readonly _mode: ExecutionMode;
  private _startedAt?: Date;
  private _finishedAt?: Date;
  private _executionTime?: number;
  private _nodeExecutions: NodeExecutionData[];
  private _triggerData?: any;
  private _errorMessage?: string;
  private _errorStack?: string;
  private readonly _createdAt: Date;

  constructor(props: WorkflowExecutionProps) {
    this._id = props.id || uuidv4();
    this._workflowId = props.workflowId;
    this._status = props.status;
    this._mode = props.mode;
    this._startedAt = props.startedAt;
    this._finishedAt = props.finishedAt;
    this._executionTime = props.executionTime;
    this._nodeExecutions = props.nodeExecutions || [];
    this._triggerData = props.triggerData;
    this._errorMessage = props.errorMessage;
    this._errorStack = props.errorStack;
    this._createdAt = props.createdAt || new Date();
  }

  // Getters
  get id(): string { return this._id; }
  get workflowId(): string { return this._workflowId; }
  get status(): ExecutionStatus { return this._status; }
  get mode(): ExecutionMode { return this._mode; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get finishedAt(): Date | undefined { return this._finishedAt; }
  get executionTime(): number | undefined { return this._executionTime; }
  get nodeExecutions(): NodeExecutionData[] { return [...this._nodeExecutions]; }
  get triggerData(): any { return this._triggerData; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get errorStack(): string | undefined { return this._errorStack; }
  get createdAt(): Date { return this._createdAt; }

  // State transitions
  start(): void {
    if (this._status !== ExecutionStatus.PENDING) {
      throw new Error('Can only start pending executions');
    }
    this._status = ExecutionStatus.RUNNING;
    this._startedAt = new Date();
  }

  complete(): void {
    if (this._status !== ExecutionStatus.RUNNING) {
      throw new Error('Can only complete running executions');
    }
    this._status = ExecutionStatus.SUCCESS;
    this._finishedAt = new Date();
    this.calculateExecutionTime();
  }

  fail(errorMessage: string, errorStack?: string): void {
    this._status = ExecutionStatus.ERROR;
    this._finishedAt = new Date();
    this._errorMessage = errorMessage;
    this._errorStack = errorStack;
    this.calculateExecutionTime();
  }

  cancel(): void {
    if (this._status === ExecutionStatus.SUCCESS || this._status === ExecutionStatus.ERROR) {
      throw new Error('Cannot cancel completed executions');
    }
    this._status = ExecutionStatus.CANCELLED;
    this._finishedAt = new Date();
    this.calculateExecutionTime();
  }

  wait(): void {
    if (this._status !== ExecutionStatus.RUNNING) {
      throw new Error('Can only wait during running executions');
    }
    this._status = ExecutionStatus.WAITING;
  }

  resume(): void {
    if (this._status !== ExecutionStatus.WAITING) {
      throw new Error('Can only resume waiting executions');
    }
    this._status = ExecutionStatus.RUNNING;
  }

  // Node execution management
  startNodeExecution(nodeId: string, nodeName: string): void {
    const existingIndex = this._nodeExecutions.findIndex(ne => ne.nodeId === nodeId);
    
    const nodeExecution: NodeExecutionData = {
      nodeId,
      nodeName,
      status: ExecutionStatus.RUNNING,
      startedAt: new Date()
    };

    if (existingIndex >= 0) {
      this._nodeExecutions[existingIndex] = nodeExecution;
    } else {
      this._nodeExecutions.push(nodeExecution);
    }
  }

  completeNodeExecution(nodeId: string, data?: any): void {
    const nodeExecution = this._nodeExecutions.find(ne => ne.nodeId === nodeId);
    if (!nodeExecution) {
      throw new Error(`Node execution not found: ${nodeId}`);
    }

    nodeExecution.status = ExecutionStatus.SUCCESS;
    nodeExecution.finishedAt = new Date();
    nodeExecution.data = data;

    if (nodeExecution.startedAt) {
      nodeExecution.executionTime = nodeExecution.finishedAt.getTime() - nodeExecution.startedAt.getTime();
    }
  }

  failNodeExecution(nodeId: string, errorMessage: string, errorStack?: string): void {
    const nodeExecution = this._nodeExecutions.find(ne => ne.nodeId === nodeId);
    if (!nodeExecution) {
      throw new Error(`Node execution not found: ${nodeId}`);
    }

    nodeExecution.status = ExecutionStatus.ERROR;
    nodeExecution.finishedAt = new Date();
    nodeExecution.error = { message: errorMessage, stack: errorStack };

    if (nodeExecution.startedAt) {
      nodeExecution.executionTime = nodeExecution.finishedAt.getTime() - nodeExecution.startedAt.getTime();
    }
  }

  getNodeExecutionData(nodeId: string): any {
    const nodeExecution = this._nodeExecutions.find(ne => ne.nodeId === nodeId);
    return nodeExecution?.data;
  }

  private calculateExecutionTime(): void {
    if (this._startedAt && this._finishedAt) {
      this._executionTime = this._finishedAt.getTime() - this._startedAt.getTime();
    }
  }

  // Statistics
  getSuccessfulNodesCount(): number {
    return this._nodeExecutions.filter(ne => ne.status === ExecutionStatus.SUCCESS).length;
  }

  getFailedNodesCount(): number {
    return this._nodeExecutions.filter(ne => ne.status === ExecutionStatus.ERROR).length;
  }

  getTotalNodesCount(): number {
    return this._nodeExecutions.length;
  }

  isComplete(): boolean {
    return this._status === ExecutionStatus.SUCCESS || 
           this._status === ExecutionStatus.ERROR || 
           this._status === ExecutionStatus.CANCELLED;
  }

  toJSON(): WorkflowExecutionProps {
    return {
      id: this._id,
      workflowId: this._workflowId,
      status: this._status,
      mode: this._mode,
      startedAt: this._startedAt,
      finishedAt: this._finishedAt,
      executionTime: this._executionTime,
      nodeExecutions: this._nodeExecutions,
      triggerData: this._triggerData,
      errorMessage: this._errorMessage,
      errorStack: this._errorStack,
      createdAt: this._createdAt
    };
  }
}
