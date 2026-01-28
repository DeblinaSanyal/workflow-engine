import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class DatabaseQueryNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'databaseQuery',
    displayName: 'Database Query',
    description: 'Execute SQL queries on databases',
    icon: '🗄️',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'connectionString',
        displayName: 'Connection String',
        type: 'credentials',
        required: true,
        placeholder: 'postgresql://user:pass@localhost:5432/db',
        description: 'Database connection string'
      },
      {
        name: 'databaseType',
        displayName: 'Database Type',
        type: 'options',
        required: true,
        default: 'postgresql',
        options: [
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'SQL Server', value: 'mssql' },
          { name: 'Oracle', value: 'oracle' },
          { name: 'SAP HANA', value: 'hana' }
        ],
        description: 'Type of database'
      },
      {
        name: 'query',
        displayName: 'SQL Query',
        type: 'string',
        required: true,
        placeholder: 'SELECT * FROM users WHERE active = true',
        description: 'SQL query to execute'
      },
      {
        name: 'parameters',
        displayName: 'Query Parameters',
        type: 'json',
        description: 'Parameterized query values'
      },
      {
        name: 'timeout',
        displayName: 'Timeout (seconds)',
        type: 'number',
        default: 30,
        description: 'Query timeout'
      }
    ],
    inputs: [
      {
        name: 'default',
        displayName: 'Input',
        type: 'any'
      }
    ],
    outputs: [
      {
        name: 'default',
        displayName: 'Output',
        type: 'any'
      }
    ]
  };

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const connectionString = this.getParameter<string>(context, 'connectionString');
      const databaseType = this.getParameter<string>(context, 'databaseType');
      const query = this.getParameter<string>(context, 'query');
      const parameters = this.getParameter<any>(context, 'parameters');
      const timeout = this.getParameter<number>(context, 'timeout');

      context.log.info(`Executing ${databaseType} query...`);

      // Mock implementation - replace with actual database connectors
      const mockResults = [
        { id: 1, name: 'User 1', email: 'user1@example.com', active: true },
        { id: 2, name: 'User 2', email: 'user2@example.com', active: true },
        { id: 3, name: 'User 3', email: 'user3@example.com', active: false }
      ];

      const result = {
        databaseType,
        query,
        rowCount: mockResults.length,
        rows: mockResults,
        executionTime: 45,
        parameters
      };

      context.log.info(`Query returned ${mockResults.length} rows`);

      return this.success(result);
    } catch (error: any) {
      context.log.error('Database query failed', error);
      return this.error(`Database error: ${error.message}`, error);
    }
  }
}
