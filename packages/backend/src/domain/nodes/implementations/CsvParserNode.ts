import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class CsvParserNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'csvParser',
    displayName: 'CSV Parser',
    description: 'Parse CSV data into JSON',
    icon: '📄',
    category: 'transform',
    version: 1,
    parameters: [
      {
        name: 'csvData',
        displayName: 'CSV Data',
        type: 'string',
        required: true,
        placeholder: 'name,email,age\nJohn,john@example.com,30',
        description: 'CSV content to parse'
      },
      {
        name: 'delimiter',
        displayName: 'Delimiter',
        type: 'options',
        default: ',',
        options: [
          { name: 'Comma (,)', value: ',' },
          { name: 'Semicolon (;)', value: ';' },
          { name: 'Tab', value: '\t' },
          { name: 'Pipe (|)', value: '|' }
        ],
        description: 'CSV delimiter character'
      },
      {
        name: 'hasHeader',
        displayName: 'Has Header Row',
        type: 'boolean',
        default: true,
        description: 'First row contains column headers'
      },
      {
        name: 'skipEmptyLines',
        displayName: 'Skip Empty Lines',
        type: 'boolean',
        default: true,
        description: 'Skip empty rows'
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
      const csvData = this.getParameter<string>(context, 'csvData');
      const delimiter = this.getParameter<string>(context, 'delimiter');
      const hasHeader = this.getParameter<boolean>(context, 'hasHeader');
      const skipEmptyLines = this.getParameter<boolean>(context, 'skipEmptyLines');

      context.log.info('Parsing CSV data...');

      // Simple CSV parser
      let lines = csvData.split('\n');
      if (skipEmptyLines) {
        lines = lines.filter(line => line.trim().length > 0);
      }

      let headers: string[] = [];
      let data: any[] = [];

      if (hasHeader && lines.length > 0) {
        headers = lines[0].split(delimiter).map(h => h.trim());
        lines = lines.slice(1);
      }

      for (const line of lines) {
        const values = line.split(delimiter).map(v => v.trim());
        if (hasHeader) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        } else {
          data.push(values);
        }
      }

      const result = {
        rowCount: data.length,
        columnCount: hasHeader ? headers.length : (data[0] ? data[0].length : 0),
        headers: hasHeader ? headers : null,
        data
      };

      context.log.info(`Parsed ${data.length} rows`);

      return this.success(result);
    } catch (error: any) {
      context.log.error('CSV parsing failed', error);
      return this.error(`CSV parsing error: ${error.message}`, error);
    }
  }
}
