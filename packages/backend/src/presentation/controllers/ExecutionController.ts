import { Request, Response, NextFunction } from 'express';
import { WorkflowRepository, WorkflowExecutionRepository } from '../../domain/repositories/IRepositories';
import { WorkflowExecutionEngine } from '../../domain/services/WorkflowExecutionEngine';
import { ExecuteWorkflowUseCase } from '../../application/usecases/ExecuteWorkflow';
import { ExecutionMode } from '../../domain/entities/WorkflowExecution';

export class ExecutionController {
  constructor(
    private workflowRepository: WorkflowRepository,
    private executionRepository: WorkflowExecutionRepository,
    private executionEngine: WorkflowExecutionEngine
  ) {}

  async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { workflowId } = req.params;
      const { triggerData, mode } = req.body;

      const useCase = new ExecuteWorkflowUseCase(
        this.workflowRepository,
        this.executionRepository,
        this.executionEngine
      );

      const execution = await useCase.execute({
        workflowId,
        mode: mode || ExecutionMode.MANUAL,
        triggerData
      });

      res.status(201).json({
        success: true,
        data: execution.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const execution = await this.executionRepository.findById(id);

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found'
        });
      }

      res.json({
        success: true,
        data: execution.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async listByWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { workflowId } = req.params;
      const { limit = 50, offset = 0, status } = req.query;

      const result = await this.executionRepository.findByWorkflowId(workflowId, {
        limit: Number(limit),
        offset: Number(offset),
        status: status as string
      });

      res.json({
        success: true,
        data: result.executions.map(e => e.toJSON()),
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async listRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;
      const executions = await this.executionRepository.findRecent(Number(limit));

      res.json({
        success: true,
        data: executions.map(e => e.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }
}
