import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createDataSource } from './infrastructure/database/config';
import { TypeORMWorkflowRepository } from './infrastructure/repositories/TypeORMWorkflowRepository';
import { TypeORMWorkflowExecutionRepository } from './infrastructure/repositories/TypeORMWorkflowExecutionRepository';
import { WorkflowExecutionEngine } from './domain/services/WorkflowExecutionEngine';
import { createRoutes } from './presentation/routes';
import { NodeRegistry } from './domain/nodes/BaseNode';

// Import and register nodes
import { HttpRequestNode } from './domain/nodes/implementations/HttpRequestNode';
import { DataTransformNode } from './domain/nodes/implementations/DataTransformNode';
import { ConditionalNode } from './domain/nodes/implementations/ConditionalNode';

// Simple logger implementation
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error || '');
  }
};

async function bootstrap() {
  try {
    // Initialize database
    logger.info('Connecting to database...');
    const dataSource = createDataSource();
    await dataSource.initialize();
    logger.info('Database connected successfully');

    // Register nodes
    logger.info('Registering nodes...');
    NodeRegistry.register(new HttpRequestNode());
    NodeRegistry.register(new DataTransformNode());
    NodeRegistry.register(new ConditionalNode());
    logger.info(`Registered ${NodeRegistry.getAll().length} node types`);

    // Initialize repositories
    const workflowRepository = new TypeORMWorkflowRepository(dataSource);
    const executionRepository = new TypeORMWorkflowExecutionRepository(dataSource);

    // Initialize execution engine
    const executionEngine = new WorkflowExecutionEngine({
      logger,
      executionTimeout: 300000 // 5 minutes
    });

    // Create Express app
    const app = express();
    
    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });

    // Routes
    const routes = createRoutes(workflowRepository, executionRepository, executionEngine);
    app.use('/api', routes);

    // Error handling
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not found'
      });
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 API available at http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

bootstrap();
