import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
import axios from 'axios';

export class SapRfcNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sapRfcCall',
    displayName: 'SAP RFC Call',
    description: 'Execute SAP Remote Function Call (RFC)',
    icon: '🔷',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'host',
        displayName: 'SAP Host',
        type: 'string',
        required: true,
        placeholder: 'sap.company.com',
        description: 'SAP system hostname or IP'
      },
      {
        name: 'client',
        displayName: 'Client',
        type: 'string',
        required: true,
        placeholder: '100',
        description: 'SAP client number'
      },
      {
        name: 'rfcName',
        displayName: 'RFC Function Name',
        type: 'string',
        required: true,
        placeholder: 'RFC_READ_TABLE',
        description: 'Name of the RFC function to call'
      },
      {
        name: 'parameters',
        displayName: 'RFC Parameters',
        type: 'json',
        default: {},
        description: 'Input parameters for the RFC function'
      },
      {
        name: 'username',
        displayName: 'Username',
        type: 'string',
        required: true,
        description: 'SAP username'
      },
      {
        name: 'password',
        displayName: 'Password',
        type: 'credentials',
        required: true,
        description: 'SAP password'
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
      const host = this.getParameter<string>(context, 'host');
      const client = this.getParameter<string>(context, 'client');
      const rfcName = this.getParameter<string>(context, 'rfcName');
      const parameters = this.getParameter<Record<string, any>>(context, 'parameters');
      const username = this.getParameter<string>(context, 'username');
      const password = this.getParameter<string>(context, 'password');

      context.log.info(`Executing SAP RFC: ${rfcName} on ${host} (client ${client})`);

      // Mock implementation - replace with actual SAP RFC connector
      // In production, use node-rfc or SAP Cloud SDK
      const mockResponse = {
        rfcName,
        status: 'SUCCESS',
        executionTime: Date.now(),
        results: {
          // Mock SAP table data
          tables: [
            { field: 'MANDT', value: client },
            { field: 'BUKRS', value: '1000' },
            { field: 'BUTXT', value: 'Company Code' }
          ],
          returnCode: 0,
          message: 'RFC executed successfully'
        },
        parameters
      };

      context.log.info('SAP RFC call completed successfully');

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('SAP RFC call failed', error);
      return this.error(`SAP RFC error: ${error.message}`, error);
    }
  }
}
