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
import { MicrosoftTeamsNode } from './domain/nodes/implementations/MicrosoftTeamsNode';
import { GoogleSheetsNode } from './domain/nodes/implementations/GoogleSheetsNode';
import { SalesforceNode } from './domain/nodes/implementations/SalesforceNode';
import { StripeNode } from './domain/nodes/implementations/StripeNode';
import { TwilioNode } from './domain/nodes/implementations/TwilioNode';
import { GitHubNode } from './domain/nodes/implementations/GitHubNode';
import { Workflow, WorkflowStatus } from './domain/entities/Workflow';
import { WorkflowRepository } from './domain/repositories/IRepositories';

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

// Helper function to add sample workflows
async function addSampleWorkflows(repository: WorkflowRepository, logger: any): Promise<void> {
  const sampleWorkflows = [
    {
      name: 'Customer Onboarding Process',
      description: 'Automate customer registration, welcome email, and CRM creation',
      status: WorkflowStatus.ACTIVE,
      tags: ['customer', 'onboarding', 'crm'],
      nodes: [
        {
          id: 'node-1',
          type: 'httpRequest',
          name: 'Fetch Customer Data',
          parameters: { method: 'GET', url: 'https://api.example.com/customers' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'sendEmail',
          name: 'Send Welcome Email',
          parameters: { to: '{{customer.email}}', subject: 'Welcome!', body: 'Welcome to our platform!' },
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'salesforce',
          name: 'Create Salesforce Contact',
          parameters: { operation: 'create', object: 'Contact' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'Invoice Processing Workflow',
      description: 'Extract invoice data, validate, and update accounting system',
      status: WorkflowStatus.ACTIVE,
      tags: ['finance', 'invoice', 'accounting'],
      nodes: [
        {
          id: 'node-1',
          type: 'csvParser',
          name: 'Parse Invoice CSV',
          parameters: { delimiter: ',', hasHeader: true },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'jsonValidator',
          name: 'Validate Invoice Data',
          parameters: {},
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'googleSheets',
          name: 'Update Accounting Sheet',
          parameters: { operation: 'append', sheetName: 'Invoices' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'Order Fulfillment Automation',
      description: 'Process orders, update inventory, and notify customers',
      status: WorkflowStatus.ACTIVE,
      tags: ['orders', 'fulfillment', 'inventory'],
      nodes: [
        {
          id: 'node-1',
          type: 'httpRequest',
          name: 'Fetch New Orders',
          parameters: { method: 'GET', url: 'https://api.shop.com/orders' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'conditional',
          name: 'Check Inventory',
          parameters: { condition: '{{inventory}} > 0' },
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'sendEmail',
          name: 'Send Confirmation',
          parameters: { to: '{{customer.email}}', subject: 'Order Confirmed' },
          position: { x: 500, y: 50 }
        },
        {
          id: 'node-4',
          type: 'slackMessage',
          name: 'Alert Out of Stock',
          parameters: { channel: '#alerts', message: 'Product out of stock' },
          position: { x: 500, y: 150 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' },
        { id: 'edge-3', sourceNodeId: 'node-2', targetNodeId: 'node-4' }
      ]
    },
    {
      name: 'GitHub Issue Notifier',
      description: 'Monitor GitHub issues and send notifications to Teams',
      status: WorkflowStatus.ACTIVE,
      tags: ['github', 'notifications', 'devops'],
      nodes: [
        {
          id: 'node-1',
          type: 'github',
          name: 'List Open Issues',
          parameters: { resource: 'issue', operation: 'list', owner: 'myorg', repo: 'myrepo' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'dataTransform',
          name: 'Format Message',
          parameters: {},
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'microsoftTeams',
          name: 'Post to Teams',
          parameters: { title: 'New GitHub Issue', text: '{{issue.title}}' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'Payment Reconciliation',
      description: 'Match Stripe payments with orders and generate reports',
      status: WorkflowStatus.ACTIVE,
      tags: ['payments', 'stripe', 'reconciliation'],
      nodes: [
        {
          id: 'node-1',
          type: 'stripe',
          name: 'Fetch Payments',
          parameters: { resource: 'charge', operation: 'list' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'databaseQuery',
          name: 'Match with Orders',
          parameters: { query: 'SELECT * FROM orders WHERE payment_id = ?' },
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'googleSheets',
          name: 'Update Report',
          parameters: { operation: 'append', sheetName: 'Reconciliation' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'SMS Alert System',
      description: 'Send SMS alerts for critical system events',
      status: WorkflowStatus.INACTIVE,
      tags: ['alerts', 'sms', 'monitoring'],
      nodes: [
        {
          id: 'node-1',
          type: 'httpRequest',
          name: 'Check System Status',
          parameters: { method: 'GET', url: 'https://api.system.com/health' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'conditional',
          name: 'Is Critical?',
          parameters: { condition: '{{status}} === "critical"' },
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'twilio',
          name: 'Send SMS Alert',
          parameters: { operation: 'sendSms', to: '+1234567890', message: 'CRITICAL: System down!' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'SAP Data Sync',
      description: 'Sync SAP data with external systems',
      status: WorkflowStatus.ACTIVE,
      tags: ['sap', 'integration', 'sync'],
      nodes: [
        {
          id: 'node-1',
          type: 'sapTableRead',
          name: 'Read SAP Table',
          parameters: { tableName: 'MARA' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'dataTransform',
          name: 'Transform Data',
          parameters: {},
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'httpRequest',
          name: 'POST to External API',
          parameters: { method: 'POST', url: 'https://api.external.com/data' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    },
    {
      name: 'AI Content Analyzer',
      description: 'Analyze content sentiment using AI and generate reports',
      status: WorkflowStatus.ACTIVE,
      tags: ['ai', 'sentiment', 'analysis'],
      nodes: [
        {
          id: 'node-1',
          type: 'httpRequest',
          name: 'Fetch Content',
          parameters: { method: 'GET', url: 'https://api.content.com/articles' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node-2',
          type: 'sentimentAnalysis',
          name: 'Analyze Sentiment',
          parameters: {},
          position: { x: 300, y: 100 }
        },
        {
          id: 'node-3',
          type: 'claudeAi',
          name: 'Generate Summary',
          parameters: { prompt: 'Summarize the sentiment analysis' },
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'edge-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' }
      ]
    }
  ];

  try {
    for (const workflowData of sampleWorkflows) {
      const workflow = new Workflow(workflowData);
      await repository.save(workflow);
      logger.info(`Added sample workflow: ${workflow.name}`);
    }
  } catch (error) {
    logger.error('Failed to add sample workflows', error);
  }
}

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
    
    // Integration nodes
    NodeRegistry.register(new MicrosoftTeamsNode());
    NodeRegistry.register(new GoogleSheetsNode());
    NodeRegistry.register(new SalesforceNode());
    NodeRegistry.register(new StripeNode());
    NodeRegistry.register(new TwilioNode());
    NodeRegistry.register(new GitHubNode());
    
    // Data processing nodes
    NodeRegistry.register(new DatabaseQueryNode());
    NodeRegistry.register(new CsvParserNode());
    NodeRegistry.register(new JsonValidatorNode());
    
    logger.info(`✅ Registered ${NodeRegistry.getAll().length} node types`);

    // Initialize in-memory repositories (no database required!)
    const workflowRepository = new InMemoryWorkflowRepository();
    const executionRepository = new InMemoryWorkflowExecutionRepository();
    logger.info('✅ In-memory storage initialized');

    // Add sample workflows for demonstration
    await addSampleWorkflows(workflowRepository, logger);
    logger.info('✅ Sample workflows loaded');

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
