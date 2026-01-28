import { Router } from 'express';
import { WorkflowController } from '../controllers/WorkflowController';
import { ExecutionController } from '../controllers/ExecutionController';
import { WorkflowRepository, WorkflowExecutionRepository } from '../../domain/repositories/IRepositories';
import { WorkflowExecutionEngine } from '../../domain/services/WorkflowExecutionEngine';
import { NodeMetadata, NodeRegistry } from '../../domain/nodes/BaseNode';

export function createRoutes(
  workflowRepository: WorkflowRepository,
  executionRepository: WorkflowExecutionRepository,
  executionEngine: WorkflowExecutionEngine
): Router {
  const router = Router();

  // Initialize controllers
  const workflowController = new WorkflowController(workflowRepository);
  const executionController = new ExecutionController(
    workflowRepository,
    executionRepository,
    executionEngine
  );

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Node types
  router.get('/nodes', (req, res) => {
    const nodes: NodeMetadata[] = NodeRegistry.getAllMetadata();
    res.json({
      success: true,
      data: nodes
    });
  });

  // Workflow routes
  router.post('/workflows', workflowController.create.bind(workflowController));
  router.get('/workflows', workflowController.list.bind(workflowController));
  router.get('/workflows/:id', workflowController.getById.bind(workflowController));
  router.put('/workflows/:id', workflowController.update.bind(workflowController));
  router.delete('/workflows/:id', workflowController.delete.bind(workflowController));
  router.post('/workflows/:id/activate', workflowController.activate.bind(workflowController));
  router.post('/workflows/:id/deactivate', workflowController.deactivate.bind(workflowController));

  // Execution routes
  router.post('/workflows/:workflowId/execute', executionController.execute.bind(executionController));
  router.get('/executions/:id', executionController.getById.bind(executionController));
  router.get('/workflows/:workflowId/executions', executionController.listByWorkflow.bind(executionController));
  router.get('/executions/recent', executionController.listRecent.bind(executionController));

  return router;
}
