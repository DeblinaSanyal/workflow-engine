import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class SapTableReadNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sapTableRead',
    displayName: 'SAP Table Read',
    description: 'Read data from SAP tables',
    icon: '📊',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'tableName',
        displayName: 'Table Name',
        type: 'string',
        required: true,
        placeholder: 'MARA',
        description: 'SAP table name to read from'
      },
      {
        name: 'fields',
        displayName: 'Fields to Select',
        type: 'string',
        placeholder: 'MATNR, MAKTX, MEINS',
        description: 'Comma-separated field names'
      },
      {
        name: 'whereClause',
        displayName: 'WHERE Clause',
        type: 'string',
        placeholder: "MATNR LIKE 'MAT%'",
        description: 'SAP WHERE condition'
      },
      {
        name: 'maxRows',
        displayName: 'Max Rows',
        type: 'number',
        default: 100,
        description: 'Maximum number of rows to return'
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
      const tableName = this.getParameter<string>(context, 'tableName');
      const fields = this.getParameter<string>(context, 'fields');
      const whereClause = this.getParameter<string>(context, 'whereClause');
      const maxRows = this.getParameter<number>(context, 'maxRows');

      context.log.info(`Reading SAP table: ${tableName}`);

      // Mock implementation
      const mockData = Array.from({ length: Math.min(5, maxRows) }, (_, i) => ({
        MATNR: `MAT${1000 + i}`,
        MAKTX: `Material ${i + 1}`,
        MEINS: 'EA',
        MATKL: 'MATGROUP1'
      }));

      const result = {
        tableName,
        fields: fields || '*',
        whereClause,
        rowCount: mockData.length,
        data: mockData,
        executedAt: new Date().toISOString()
      };

      context.log.info(`Retrieved ${mockData.length} rows from ${tableName}`);

      return this.success(result);
    } catch (error: any) {
      context.log.error('SAP table read failed', error);
      return this.error(`Table read error: ${error.message}`, error);
    }
  }
}
