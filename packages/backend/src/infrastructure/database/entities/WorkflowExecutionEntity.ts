import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExecutionStatus, ExecutionMode, NodeExecutionData } from '../../../domain/entities/WorkflowExecution';
import { WorkflowEntity } from './WorkflowEntity';

@Entity('workflow_executions')
export class WorkflowExecutionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workflowId!: string;

  @ManyToOne(() => WorkflowEntity)
  @JoinColumn({ name: 'workflowId' })
  workflow?: WorkflowEntity;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING
  })
  status!: ExecutionStatus;

  @Column({
    type: 'enum',
    enum: ExecutionMode,
    default: ExecutionMode.MANUAL
  })
  mode!: ExecutionMode;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt?: Date;

  @Column({ type: 'integer', nullable: true })
  executionTime?: number;

  @Column({ type: 'jsonb', default: [] })
  nodeExecutions!: NodeExecutionData[];

  @Column({ type: 'jsonb', nullable: true })
  triggerData?: any;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  errorStack?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
