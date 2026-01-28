import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WorkflowNode, WorkflowConnection, WorkflowSettings, WorkflowStatus } from '../../../domain/entities/Workflow';

@Entity('workflows')
export class WorkflowEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  nodes!: WorkflowNode[];

  @Column({ type: 'jsonb' })
  connections!: WorkflowConnection[];

  @Column({ type: 'jsonb', default: {} })
  settings!: WorkflowSettings;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.INACTIVE
  })
  status!: WorkflowStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;
}
