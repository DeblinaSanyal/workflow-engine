import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class GoogleSheetsNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'googleSheets',
    displayName: 'Google Sheets',
    description: 'Read from and write to Google Sheets',
    icon: '📊',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'credentials',
        displayName: 'Google Credentials',
        type: 'credentials',
        required: true,
        description: 'Google service account credentials (JSON)'
      },
      {
        name: 'spreadsheetId',
        displayName: 'Spreadsheet ID',
        type: 'string',
        required: true,
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        description: 'Google Sheets spreadsheet ID'
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'read',
        options: [
          { name: 'Read', value: 'read' },
          { name: 'Append', value: 'append' },
          { name: 'Update', value: 'update' },
          { name: 'Clear', value: 'clear' }
        ],
        description: 'Operation to perform'
      },
      {
        name: 'sheetName',
        displayName: 'Sheet Name',
        type: 'string',
        default: 'Sheet1',
        placeholder: 'Sheet1',
        description: 'Name of the sheet/tab'
      },
      {
        name: 'range',
        displayName: 'Range',
        type: 'string',
        placeholder: 'A1:D10',
        description: 'Cell range (e.g., A1:D10)'
      },
      {
        name: 'values',
        displayName: 'Values',
        type: 'json',
        description: 'Values to write (2D array)'
      },
      {
        name: 'valueInputOption',
        displayName: 'Value Input Option',
        type: 'options',
        default: 'USER_ENTERED',
        options: [
          { name: 'User Entered', value: 'USER_ENTERED' },
          { name: 'Raw', value: 'RAW' }
        ],
        description: 'How values should be interpreted'
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
      const spreadsheetId = this.getParameter<string>(context, 'spreadsheetId');
      const operation = this.getParameter<string>(context, 'operation');
      const sheetName = this.getParameter<string>(context, 'sheetName');
      const range = this.getParameter<string>(context, 'range');
      const values = this.getParameter<any>(context, 'values');

      context.log.info(`Performing ${operation} operation on Google Sheets...`);

      // Mock implementation
      let mockResponse: any = {
        spreadsheetId,
        operation,
        sheetName,
        range: `${sheetName}!${range || 'A1'}`,
        executedAt: new Date().toISOString()
      };

      switch (operation) {
        case 'read':
          mockResponse.values = [
            ['Name', 'Email', 'Department', 'Status'],
            ['John Doe', 'john@example.com', 'IT', 'Active'],
            ['Jane Smith', 'jane@example.com', 'HR', 'Active']
          ];
          mockResponse.rowCount = 3;
          break;
        case 'append':
        case 'update':
          mockResponse.updatedCells = values?.length || 0;
          mockResponse.updatedRows = values?.length || 0;
          mockResponse.values = values;
          break;
        case 'clear':
          mockResponse.clearedRange = `${sheetName}!${range}`;
          break;
      }

      context.log.info(`Google Sheets ${operation} operation completed successfully`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Google Sheets operation failed', error);
      return this.error(`Google Sheets error: ${error.message}`, error);
    }
  }
}
