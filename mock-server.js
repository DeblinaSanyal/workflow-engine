const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock node types with all the available nodes
const mockNodeTypes = [
  {
    name: 'httpRequest',
    displayName: 'HTTP Request',
    description: 'Make HTTP requests to APIs',
    icon: '🌐',
    category: 'action',
    version: 1,
    parameters: [
      { name: 'method', displayName: 'Method', type: 'options', required: true, options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'url', displayName: 'URL', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'dataTransform',
    displayName: 'Data Transform',
    description: 'Transform data using JavaScript',
    icon: '🔄',
    category: 'transform',
    version: 1,
    parameters: [
      { name: 'code', displayName: 'JavaScript Code', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'conditional',
    displayName: 'Conditional',
    description: 'Route based on conditions',
    icon: '🔀',
    category: 'control',
    version: 1,
    parameters: [
      { name: 'condition', displayName: 'Condition', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [
      { name: 'true', displayName: 'True', type: 'any' },
      { name: 'false', displayName: 'False', type: 'any' }
    ]
  },
  {
    name: 'sendEmail',
    displayName: 'Send Email',
    description: 'Send email notifications',
    icon: '📧',
    category: 'action',
    version: 1,
    parameters: [
      { name: 'to', displayName: 'To', type: 'string', required: true },
      { name: 'subject', displayName: 'Subject', type: 'string', required: true },
      { name: 'body', displayName: 'Body', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'slackMessage',
    displayName: 'Slack Message',
    description: 'Send Slack messages',
    icon: '💬',
    category: 'integration',
    version: 1,
    parameters: [
      { name: 'channel', displayName: 'Channel', type: 'string', required: true },
      { name: 'message', displayName: 'Message', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'csvParser',
    displayName: 'CSV Parser',
    description: 'Parse CSV data',
    icon: '📊',
    category: 'transform',
    version: 1,
    parameters: [
      { name: 'delimiter', displayName: 'Delimiter', type: 'string', required: false }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'jsonValidator',
    displayName: 'JSON Validator',
    description: 'Validate JSON schema',
    icon: '✅',
    category: 'transform',
    version: 1,
    parameters: [
      { name: 'schema', displayName: 'JSON Schema', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [
      { name: 'valid', displayName: 'Valid', type: 'any' },
      { name: 'invalid', displayName: 'Invalid', type: 'any' }
    ]
  },
  {
    name: 'databaseQuery',
    displayName: 'Database Query',
    description: 'Execute database queries',
    icon: '🗄️',
    category: 'action',
    version: 1,
    parameters: [
      { name: 'query', displayName: 'SQL Query', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  }
];

// Mock workflows with sample data
let workflows = [
  {
    id: '1',
    name: 'Email Notification Pipeline',
    description: 'Sends email notifications when new data is received',
    status: 'ACTIVE',
    tags: ['email', 'notification', 'production'],
    nodes: [
      { id: '1', type: 'httpRequest', name: 'Fetch Data', parameters: {}, position: { x: 100, y: 100 } },
      { id: '2', type: 'dataTransform', name: 'Transform Data', parameters: {}, position: { x: 350, y: 100 } },
      { id: '3', type: 'sendEmail', name: 'Send Email', parameters: {}, position: { x: 600, y: 100 } }
    ],
    connections: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'default', targetInput: 'default' }
    ],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '2',
    name: 'Data Validation Flow',
    description: 'Validates incoming JSON data and routes based on validation results',
    status: 'ACTIVE',
    tags: ['validation', 'json', 'production'],
    nodes: [
      { id: '1', type: 'httpRequest', name: 'Receive Data', parameters: {}, position: { x: 100, y: 100 } },
      { id: '2', type: 'jsonValidator', name: 'Validate JSON', parameters: {}, position: { x: 350, y: 100 } },
      { id: '3', type: 'sendEmail', name: 'Success Email', parameters: {}, position: { x: 600, y: 50 } },
      { id: '4', type: 'slackMessage', name: 'Error Alert', parameters: {}, position: { x: 600, y: 150 } }
    ],
    connections: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'valid', targetInput: 'default' },
      { id: 'e3', sourceNodeId: '2', targetNodeId: '4', sourceOutput: 'invalid', targetInput: 'default' }
    ],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString()
  },
  {
    id: '3',
    name: 'CSV Processing Workflow',
    description: 'Processes CSV files and stores results in database',
    status: 'DRAFT',
    tags: ['csv', 'database', 'batch'],
    nodes: [
      { id: '1', type: 'httpRequest', name: 'Download CSV', parameters: {}, position: { x: 100, y: 100 } },
      { id: '2', type: 'csvParser', name: 'Parse CSV', parameters: {}, position: { x: 350, y: 100 } },
      { id: '3', type: 'databaseQuery', name: 'Insert to DB', parameters: {}, position: { x: 600, y: 100 } }
    ],
    connections: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'default', targetInput: 'default' }
    ],
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '4',
    name: 'Conditional Routing Example',
    description: 'Routes data based on conditional logic',
    status: 'ACTIVE',
    tags: ['routing', 'conditional', 'example'],
    nodes: [
      { id: '1', type: 'httpRequest', name: 'Fetch Data', parameters: {}, position: { x: 100, y: 100 } },
      { id: '2', type: 'conditional', name: 'Check Condition', parameters: {}, position: { x: 350, y: 100 } },
      { id: '3', type: 'sendEmail', name: 'True Path', parameters: {}, position: { x: 600, y: 50 } },
      { id: '4', type: 'slackMessage', name: 'False Path', parameters: {}, position: { x: 600, y: 150 } }
    ],
    connections: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'true', targetInput: 'default' },
      { id: 'e3', sourceNodeId: '2', targetNodeId: '4', sourceOutput: 'false', targetInput: 'default' }
    ],
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString()
  },
  {
    id: '5',
    name: 'Multi-Channel Notification',
    description: 'Sends notifications through multiple channels simultaneously',
    status: 'INACTIVE',
    tags: ['notification', 'email', 'slack'],
    nodes: [
      { id: '1', type: 'httpRequest', name: 'Get Event', parameters: {}, position: { x: 100, y: 100 } },
      { id: '2', type: 'dataTransform', name: 'Format Message', parameters: {}, position: { x: 350, y: 100 } },
      { id: '3', type: 'sendEmail', name: 'Email Alert', parameters: {}, position: { x: 600, y: 50 } },
      { id: '4', type: 'slackMessage', name: 'Slack Alert', parameters: {}, position: { x: 600, y: 150 } }
    ],
    connections: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'default', targetInput: 'default' },
      { id: 'e3', sourceNodeId: '2', targetNodeId: '4', sourceOutput: 'default', targetInput: 'default' }
    ],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-05').toISOString()
  }
];

// GET /api/nodes
app.get('/api/nodes', (req, res) => {
  console.log('[Mock API] GET /api/nodes');
  res.json({ success: true, data: mockNodeTypes });
});

// GET /api/workflows
app.get('/api/workflows', (req, res) => {
  console.log('[Mock API] GET /api/workflows');
  res.json({ success: true, data: workflows });
});

// POST /api/workflows
app.post('/api/workflows', (req, res) => {
  console.log('[Mock API] POST /api/workflows', req.body);
  const workflow = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  workflows.push(workflow);
  res.json({ success: true, data: workflow });
});

// GET /api/workflows/:id
app.get('/api/workflows/:id', (req, res) => {
  console.log('[Mock API] GET /api/workflows/' + req.params.id);
  const workflow = workflows.find(w => w.id === req.params.id);
  if (workflow) {
    res.json({ success: true, data: workflow });
  } else {
    res.status(404).json({ success: false, error: 'Workflow not found' });
  }
});

// PUT /api/workflows/:id
app.put('/api/workflows/:id', (req, res) => {
  console.log('[Mock API] PUT /api/workflows/' + req.params.id, req.body);
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    workflows[index] = { ...workflows[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: workflows[index] });
  } else {
    res.status(404).json({ success: false, error: 'Workflow not found' });
  }
});

// DELETE /api/workflows/:id
app.delete('/api/workflows/:id', (req, res) => {
  console.log('[Mock API] DELETE /api/workflows/' + req.params.id);
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    workflows.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Workflow not found' });
  }
});

// POST /api/workflows/:id/execute
app.post('/api/workflows/:workflowId/execute', (req, res) => {
  console.log('[Mock API] POST /api/workflows/' + req.params.workflowId + '/execute');
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      workflowId: req.params.workflowId,
      status: 'SUCCESS',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      nodeResults: []
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Mock API Server Running on :${PORT}   ║
╚════════════════════════════════════════╝

Available endpoints:
  GET    /api/nodes
  GET    /api/workflows
  POST   /api/workflows
  GET    /api/workflows/:id
  PUT    /api/workflows/:id
  DELETE /api/workflows/:id
  POST   /api/workflows/:workflowId/execute

Frontend: http://localhost:5173
Backend:  http://localhost:3000
  `);
});
