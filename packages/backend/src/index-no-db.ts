import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { InMemoryWorkflowRepository } from './infrastructure/repositories/InMemoryWorkflowRepository';
import { InMemoryWorkflowExecutionRepository } from './infrastructure/repositories/InMemoryWorkflowExecutionRepository';
import { WorkflowExecutionEngine } from './domain/services/WorkflowExecutionEngine';
import { createRoutes } from './presentation/routes';
import { NodeRegistry } from './domain/nodes/BaseNode';

// Import and register nodes
import { HttpRequestNode } from './domain/nodes/implementations/HttpRequestNode';
import { DataTransformNode } from './domain/nodes/implementations/DataTransformNode';
import { ConditionalNode } from './domain/nodes/implementations/ConditionalNode';
import { SapRfcNode } from './domain/nodes/implementations/SapRfcNode';
import { SapBapiNode } from './domain/nodes/implementations/SapBapiNode';
import { SapTableReadNode } from './domain/nodes/implementations/SapTableReadNode';
import { SapODataNode } from './domain/nodes/implementations/SapODataNode';
import { OpenAiNode } from './domain/nodes/implementations/OpenAiNode';
import { ClaudeAiNode } from './domain/nodes/implementations/ClaudeAiNode';
import { SentimentAnalysisNode } from './domain/nodes/implementations/SentimentAnalysisNode';
import { SendEmailNode } from './domain/nodes/implementations/SendEmailNode';
import { SlackMessageNode } from './domain/nodes/implementations/SlackMessageNode';
import { DatabaseQueryNode } from './domain/nodes/implementations/DatabaseQueryNode';
import { CsvParserNode } from './domain/nodes/implementations/CsvParserNode';
import { JsonValidatorNode } from './domain/nodes/implementations/JsonValidatorNode';

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
    logger.info('🚀 Starting Workflow Engine (In-Memory Mode)...');

    // Register nodes
    logger.info('Registering nodes...');
    
    // Core nodes
    NodeRegistry.register(new HttpRequestNode());
    NodeRegistry.register(new DataTransformNode());
    NodeRegistry.register(new ConditionalNode());
    
    // SAP Integration nodes
    NodeRegistry.register(new SapRfcNode());
    NodeRegistry.register(new SapBapiNode());
    NodeRegistry.register(new SapTableReadNode());
    NodeRegistry.register(new SapODataNode());
    
    // AI/Agentic nodes
    NodeRegistry.register(new OpenAiNode());
    NodeRegistry.register(new ClaudeAiNode());
    NodeRegistry.register(new SentimentAnalysisNode());
    
    // Communication nodes
    NodeRegistry.register(new SendEmailNode());
    NodeRegistry.register(new SlackMessageNode());
    
    // Data processing nodes
    NodeRegistry.register(new DatabaseQueryNode());
    NodeRegistry.register(new CsvParserNode());
    NodeRegistry.register(new JsonValidatorNode());
    
    logger.info(`✅ Registered ${NodeRegistry.getAll().length} node types`);

    // Initialize in-memory repositories (no database required!)
    const workflowRepository = new InMemoryWorkflowRepository();
    const executionRepository = new InMemoryWorkflowExecutionRepository();
    logger.info('✅ In-memory storage initialized');

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
      logger.info('='.repeat(60));
      logger.info('🚀 Workflow Engine Server Ready!');
      logger.info('='.repeat(60));
      logger.info(`📝 API:     http://localhost:${PORT}/api`);
      logger.info(`🗄️  Storage: In-Memory (no database required)`);
      logger.info(`⚙️  Nodes:   ${NodeRegistry.getAll().length} types registered`);
      logger.info('='.repeat(60));
      logger.info('💡 Note: All data is stored in memory and will be lost on restart');
      logger.info('='.repeat(60));
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
