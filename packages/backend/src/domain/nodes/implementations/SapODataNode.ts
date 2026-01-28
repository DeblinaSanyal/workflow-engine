import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
import axios from 'axios';

export class SapODataNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sapOData',
    displayName: 'SAP OData Query',
    description: 'Query SAP OData services',
    icon: '🌐',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'serviceUrl',
        displayName: 'Service URL',
        type: 'string',
        required: true,
        placeholder: 'https://sap.com/sap/opu/odata/sap/SERVICE',
        description: 'SAP OData service endpoint'
      },
      {
        name: 'entitySet',
        displayName: 'Entity Set',
        type: 'string',
        required: true,
        placeholder: 'SalesOrderSet',
        description: 'OData entity set name'
      },
      {
        name: 'filter',
        displayName: '$filter',
        type: 'string',
        placeholder: "Status eq 'OPEN'",
        description: 'OData filter expression'
      },
      {
        name: 'select',
        displayName: '$select',
        type: 'string',
        placeholder: 'OrderID,CustomerName,Amount',
        description: 'Fields to select'
      },
      {
        name: 'top',
        displayName: '$top',
        type: 'number',
        default: 50,
        description: 'Number of records to return'
      },
      {
        name: 'expand',
        displayName: '$expand',
        type: 'string',
        placeholder: 'ToItems',
        description: 'Navigation properties to expand'
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
      const serviceUrl = this.getParameter<string>(context, 'serviceUrl');
      const entitySet = this.getParameter<string>(context, 'entitySet');
      const filter = this.getParameter<string>(context, 'filter');
      const select = this.getParameter<string>(context, 'select');
      const top = this.getParameter<number>(context, 'top');
      const expand = this.getParameter<string>(context, 'expand');

      context.log.info(`Querying SAP OData: ${entitySet}`);

      // Build OData query
      let query = `${serviceUrl}/${entitySet}?`;
      if (filter) query += `$filter=${encodeURIComponent(filter)}&`;
      if (select) query += `$select=${select}&`;
      if (top) query += `$top=${top}&`;
      if (expand) query += `$expand=${expand}&`;

      // Mock implementation
      const mockResults = {
        d: {
          results: Array.from({ length: Math.min(5, top) }, (_, i) => ({
            OrderID: `ORDER-${1000 + i}`,
            CustomerName: `Customer ${i + 1}`,
            Amount: (1000 + i * 500).toString(),
            Currency: 'EUR',
            Status: i % 2 === 0 ? 'OPEN' : 'CLOSED',
            CreatedAt: new Date().toISOString()
          }))
        }
      };

      context.log.info(`Retrieved ${mockResults.d.results.length} records`);

      return this.success({
        query,
        entitySet,
        count: mockResults.d.results.length,
        data: mockResults.d.results
      });
    } catch (error: any) {
      context.log.error('SAP OData query failed', error);
      return this.error(`OData error: ${error.message}`, error);
    }
  }
}
