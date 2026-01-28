const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock node types data
const mockNodes = [
  {
    name: 'httpRequest',
    displayName: 'HTTP Request',
    description: 'Make HTTP requests to any API',
    category: 'action',
    icon: '🌐',
    version: '1.0.0',
    parameters: [
      { name: 'method', displayName: 'Method', type: 'string', required: true },
      { name: 'url', displayName: 'URL', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'dataTransform',
    displayName: 'Data Transform',
    description: 'Transform data using JavaScript',
    category: 'transform',
    icon: '⚙️',
    version: '1.0.0',
    parameters: [
      { name: 'code', displayName: 'JavaScript Code', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'conditional',
    displayName: 'Conditional',
    description: 'Route workflow based on conditions',
    category: 'logic',
    icon: '🔀',
    version: '1.0.0',
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
    name: 'delay',
    displayName: 'Delay',
    description: 'Wait for a specified amount of time',
    category: 'utility',
    icon: '⏱️',
    version: '1.0.0',
    parameters: [
      { name: 'duration', displayName: 'Duration (ms)', type: 'number', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'emailSend',
    displayName: 'Send Email',
    description: 'Send email notifications',
    category: 'communication',
    icon: '📧',
    version: '1.0.0',
    parameters: [
      { name: 'to', displayName: 'To', type: 'string', required: true },
      { name: 'subject', displayName: 'Subject', type: 'string', required: true },
      { name: 'body', displayName: 'Body', type: 'string', required: true }
    ],
    inputs: [{ name: 'default', displayName: 'Input', type: 'any' }],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  },
  {
    name: 'webhook',
    displayName: 'Webhook',
    description: 'Trigger workflow from webhook',
    category: 'trigger',
    icon: '🔔',
    version: '1.0.0',
    parameters: [],
    inputs: [],
    outputs: [{ name: 'default', displayName: 'Output', type: 'any' }]
  }
];

// API endpoint to get available nodes
app.get('/api/nodes', (req, res) => {
  console.log('[Mock Server] GET /api/nodes');
  res.json(mockNodes);
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server running' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          MOCK BACKEND SERVER RUNNING                      ║
║                                                           ║
║  Server:    http://localhost:${PORT}                         ║
║  Nodes API: http://localhost:${PORT}/api/nodes               ║
║                                                           ║
║  This is a mock server for testing frontend features     ║
║  without requiring a PostgreSQL database connection.     ║
╚══════════════════════════════════════════════════════════╝
  `);
});
