import { Request, Response, NextFunction } from 'express';
import { WorkflowRepository } from '../../domain/repositories/IRepositories';
import { CreateWorkflowUseCase } from '../../application/usecases/CreateWorkflow';
import { WorkflowStatus } from '../../domain/entities/Workflow';

export class WorkflowController {
  constructor(private workflowRepository: WorkflowRepository) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new CreateWorkflowUseCase(this.workflowRepository);
      const workflow = await useCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workflow = await this.workflowRepository.findById(id);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 50, offset = 0, status, tags } = req.query;

      const result = await this.workflowRepository.findAll({
        limit: Number(limit),
        offset: Number(offset),
        status: status as string,
        tags: tags ? (tags as string).split(',') : undefined
      });

      res.json({
        success: true,
        data: result.workflows.map(w => w.toJSON()),
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workflow = await this.workflowRepository.findById(id);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      // Update workflow properties
      if (req.body.name) workflow.updateName(req.body.name);
      if (req.body.description !== undefined) workflow.updateDescription(req.body.description);
      if (req.body.nodes) workflow.updateNodes(req.body.nodes);
      if (req.body.connections) workflow.updateConnections(req.body.connections);
      if (req.body.settings) workflow.updateSettings(req.body.settings);

      const updated = await this.workflowRepository.update(workflow);

      res.json({
        success: true,
        data: updated.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.workflowRepository.delete(id);

      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workflow = await this.workflowRepository.findById(id);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      workflow.activate();
      const updated = await this.workflowRepository.update(workflow);

      res.json({
        success: true,
        data: updated.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workflow = await this.workflowRepository.findById(id);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }

      workflow.deactivate();
      const updated = await this.workflowRepository.update(workflow);

      res.json({
        success: true,
        data: updated.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}
