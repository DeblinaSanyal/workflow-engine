# Workflow Automation Platform

A scalable, production-ready workflow automation platform built from scratch with TypeScript, React, and Node.js. Think n8n-style visual workflow builder with a clean, extensible architecture.

## 🏗️ Architecture

This project follows **Clean Architecture** and **Domain-Driven Design** principles:

```
packages/
├── backend/              # Node.js/TypeScript backend
│   ├── domain/          # Core business logic
│   │   ├── entities/    # Domain entities (Workflow, WorkflowExecution)
│   │   ├── nodes/       # Node system architecture
│   │   ├── services/    # Domain services (WorkflowExecutionEngine)
│   │   └── repositories/# Repository interfaces
│   ├── application/     # Use cases
│   ├── infrastructure/  # External concerns (DB, messaging)
│   │   ├── database/    # TypeORM entities & config
│   │   └── repositories/# Repository implementations
│   └── presentation/    # API layer (Controllers, Routes)
└── frontend/            # React/TypeScript frontend
    ├── components/      # React components
    ├── pages/          # Page components
    ├── services/       # API client
    ├── stores/         # Zustand state management
    └── utils/          # Utility functions
```

### Key Design Patterns

- **Domain-Driven Design**: Core business logic isolated in domain layer
- **Repository Pattern**: Clean separation between domain and data access
- **Strategy Pattern**: Extensible node system via BaseNode abstract class
- **Observer Pattern**: React Flow for visual workflow management
- **Clean Architecture**: Dependencies point inward, domain is independent

## 🚀 Features

### Backend
- ✅ Domain-driven workflow engine
- ✅ Extensible node system (easily add custom nodes)
- ✅ Topological sorting for execution order
- ✅ Circular dependency detection
- ✅ Type-safe node parameters with validation
- ✅ PostgreSQL persistence with TypeORM
- ✅ RESTful API with Express
- ✅ Comprehensive error handling
- ✅ Execution history tracking

### Frontend
- ✅ Visual workflow builder with React Flow
- ✅ Drag-and-drop node creation
- ✅ Real-time node configuration panel
- ✅ Node palette with search
- ✅ Workflow management (CRUD operations)
- ✅ Responsive design with Tailwind CSS
- ✅ Type-safe API client
- ✅ Zustand for state management

## 📦 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🛠️ Setup

### 1. Install Dependencies

```bash
# From project root
npm install

# Or install packages individually
cd packages/backend && npm install
cd packages/frontend && npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb workflow_engine
```

### 3. Environment Configuration

Create `.env` file in `packages/backend`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=workflow_engine

# Server
PORT=3000
NODE_ENV=development
```

### 4. Start Development Servers

#### Backend
```bash
cd packages/backend
npm run dev
```

Server runs on `http://localhost:3000`

#### Frontend
```bash
cd packages/frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 5. Production Build

```bash
# Backend
cd packages/backend
npm run build
npm start

# Frontend
cd packages/frontend
npm run build
npm run preview
```

## 🎯 Usage

### Creating a Workflow

1. Navigate to `http://localhost:5173`
2. Click "New Workflow"
3. Drag nodes from the left palette onto the canvas
4. Connect nodes by dragging from output handles to input handles
5. Click nodes to configure parameters in the right panel
6. Save and execute your workflow

### Adding Custom Nodes

Create a new node by extending `BaseNode`:

```typescript
// packages/backend/src/domain/nodes/implementations/MyCustomNode.ts
import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class MyCustomNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'myCustomNode',
    displayName: 'My Custom Node',
    description: 'Does something custom',
    icon: '🔧',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'input',
        displayName: 'Input Value',
        type: 'string',
        required: true,
        description: 'Your custom input'
      }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  };

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const input = this.getParameter<string>(context, 'input');
      
      // Your custom logic here
      const result = `Processed: ${input}`;
      
      return this.success(result);
    } catch (error: any) {
      return this.error(error.message, error);
    }
  }
}
```

Register your node in `packages/backend/src/index.ts`:

```typescript
import { MyCustomNode } from './domain/nodes/implementations/MyCustomNode';

NodeRegistry.register(new MyCustomNode());
```

## 🔌 API Endpoints

### Workflows

- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/activate` - Activate workflow
- `POST /api/workflows/:id/deactivate` - Deactivate workflow

### Executions

- `POST /api/workflows/:workflowId/execute` - Execute workflow
- `GET /api/executions/:id` - Get execution
- `GET /api/workflows/:workflowId/executions` - List executions for workflow
- `GET /api/executions/recent` - Get recent executions

### Node Types

- `GET /api/nodes` - List all available node types

## 🧩 Built-in Nodes

### HTTP Request Node
Make HTTP requests to any API

**Parameters:**
- Method (GET, POST, PUT, PATCH, DELETE)
- URL
- Headers (JSON)
- Body (JSON)
- Timeout

### Data Transform Node
Transform data using JavaScript

**Parameters:**
- JavaScript Code (function to transform input data)

### Conditional Node
Route workflow based on conditions

**Parameters:**
- Condition (JavaScript expression returning boolean)

## 🏛️ Architecture Deep Dive

### Workflow Execution Flow

1. **Validation**: Workflow structure validated (circular dependencies, node types)
2. **Topological Sort**: Nodes sorted in execution order using Kahn's algorithm
3. **Sequential Execution**: Nodes executed in order with proper data flow
4. **Error Handling**: Errors captured and execution halted gracefully
5. **Persistence**: Execution state and results saved to database

### Node System

The node system is designed for maximum extensibility:

- **BaseNode**: Abstract base class with parameter validation
- **NodeMetadata**: Type-safe node definition
- **NodeRegistry**: Central registry for node types
- **NodeExecutionContext**: Provides nodes with execution environment
- **NodeExecutionResult**: Standardized result format

### State Management

- **Backend**: Domain entities enforce business rules
- **Frontend**: Zustand for global state, React Flow for canvas state
- **API**: RESTful with TypeScript contracts

## 🔒 Security Considerations

- Input validation on all API endpoints
- Parameter validation for node execution
- SQL injection prevention via TypeORM parameterized queries
- CORS configuration for cross-origin requests
- Rate limiting recommended for production

## 📈 Scalability

### Current Architecture
- Single-server deployment
- PostgreSQL for persistence
- Synchronous workflow execution

### Scaling Options
- **Horizontal Scaling**: Add load balancer, run multiple instances
- **Async Execution**: Integrate BullMQ for queue-based execution
- **Distributed Execution**: Split workflow execution across workers
- **Caching**: Add Redis for execution state caching
- **Monitoring**: Integrate logging and metrics (Prometheus, Grafana)

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test
```

## 🚧 Future Enhancements

- [ ] Webhook triggers
- [ ] Scheduled executions (cron)
- [ ] Workflow templates
- [ ] User authentication & authorization
- [ ] Shared workflows / collaboration
- [ ] Real-time execution monitoring (WebSocket)
- [ ] Workflow versioning
- [ ] Execution retry mechanisms
- [ ] Parallel execution support
- [ ] Credentials management
- [ ] Custom node marketplace

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Contact

Questions? Issues? Open a GitHub issue or reach out!

---

Built with ❤️ using TypeScript, React, Node.js, and clean architecture principles.
