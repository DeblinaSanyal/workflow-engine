import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class SapBapiNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sapBapi',
    displayName: 'SAP BAPI Execute',
    description: 'Execute SAP Business API (BAPI)',
    icon: '🔹',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'bapiName',
        displayName: 'BAPI Name',
        type: 'string',
        required: true,
        placeholder: 'BAPI_SALESORDER_CREATEFROMDAT2',
        description: 'Name of the BAPI to execute'
      },
      {
        name: 'method',
        displayName: 'Method',
        type: 'options',
        required: true,
        default: 'CREATE',
        options: [
          { name: 'Create', value: 'CREATE' },
          { name: 'Update', value: 'UPDATE' },
          { name: 'Read', value: 'READ' },
          { name: 'Delete', value: 'DELETE' }
        ],
        description: 'BAPI operation method'
      },
      {
        name: 'businessObject',
        displayName: 'Business Object',
        type: 'string',
        placeholder: 'SalesOrder',
        description: 'SAP business object type'
      },
      {
        name: 'inputData',
        displayName: 'Input Data',
        type: 'json',
        required: true,
        description: 'BAPI input structure'
      },
      {
        name: 'commit',
        displayName: 'Auto Commit',
        type: 'boolean',
        default: true,
        description: 'Automatically commit transaction'
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
      const bapiName = this.getParameter<string>(context, 'bapiName');
      const method = this.getParameter<string>(context, 'method');
      const businessObject = this.getParameter<string>(context, 'businessObject');
      const inputData = this.getParameter<any>(context, 'inputData');
      const commit = this.getParameter<boolean>(context, 'commit');

      context.log.info(`Executing SAP BAPI: ${bapiName} (${method})`);

      // Mock implementation
      const mockResponse = {
        bapiName,
        method,
        businessObject,
        success: true,
        documentNumber: `DOC-${Date.now()}`,
        return: {
          type: 'S',
          id: 'BAPI',
          number: '000',
          message: 'BAPI executed successfully'
        },
        outputData: {
          ...inputData,
          status: 'PROCESSED',
          createdAt: new Date().toISOString()
        },
        committed: commit
      };

      context.log.info(`BAPI ${bapiName} executed successfully`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('SAP BAPI execution failed', error);
      return this.error(`BAPI error: ${error.message}`, error);
    }
  }
}
