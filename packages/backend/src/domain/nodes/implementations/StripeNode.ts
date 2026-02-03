import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class StripeNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'stripe',
    displayName: 'Stripe',
    description: 'Process payments and manage Stripe data',
    icon: '💳',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'apiKey',
        displayName: 'API Key',
        type: 'credentials',
        required: true,
        placeholder: 'sk_test_...',
        description: 'Stripe secret API key'
      },
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'customer',
        options: [
          { name: 'Customer', value: 'customer' },
          { name: 'Payment Intent', value: 'paymentIntent' },
          { name: 'Charge', value: 'charge' },
          { name: 'Subscription', value: 'subscription' },
          { name: 'Invoice', value: 'invoice' }
        ],
        description: 'Stripe resource type'
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'get',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'List', value: 'list' }
        ],
        description: 'Operation to perform'
      },
      {
        name: 'resourceId',
        displayName: 'Resource ID',
        type: 'string',
        placeholder: 'cus_...',
        description: 'Stripe resource ID'
      },
      {
        name: 'data',
        displayName: 'Data',
        type: 'json',
        description: 'Resource data as JSON object'
      },
      {
        name: 'limit',
        displayName: 'Limit',
        type: 'number',
        default: 10,
        description: 'Number of records to return (for list operation)'
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
      const resource = this.getParameter<string>(context, 'resource');
      const operation = this.getParameter<string>(context, 'operation');
      const resourceId = this.getParameter<string>(context, 'resourceId');
      const data = this.getParameter<any>(context, 'data');
      const limit = this.getParameter<number>(context, 'limit');

      context.log.info(`Performing ${operation} on Stripe ${resource}...`);

      // Mock implementation
      let mockResponse: any = {
        object: resource,
        operation,
        executedAt: new Date().toISOString()
      };

      const mockId = resourceId || `${resource}_${Date.now()}`;

      switch (operation) {
        case 'get':
          mockResponse.data = {
            id: mockId,
            object: resource,
            created: Math.floor(Date.now() / 1000),
            livemode: false,
            ...this.getMockResourceData(resource)
          };
          break;
        case 'create':
          mockResponse.data = {
            id: mockId,
            object: resource,
            created: Math.floor(Date.now() / 1000),
            livemode: false,
            ...data
          };
          break;
        case 'update':
          mockResponse.data = {
            id: mockId,
            object: resource,
            updated: Math.floor(Date.now() / 1000),
            ...data
          };
          break;
        case 'delete':
          mockResponse.deleted = true;
          mockResponse.id = mockId;
          break;
        case 'list':
          mockResponse.data = Array.from({ length: Math.min(limit || 10, 3) }, (_, i) => ({
            id: `${resource}_${Date.now() + i}`,
            object: resource,
            ...this.getMockResourceData(resource)
          }));
          mockResponse.has_more = false;
          break;
      }

      context.log.info(`Stripe ${operation} on ${resource} completed successfully`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Stripe operation failed', error);
      return this.error(`Stripe error: ${error.message}`, error);
    }
  }

  private getMockResourceData(resource: string): any {
    switch (resource) {
      case 'customer':
        return {
          email: 'customer@example.com',
          name: 'John Doe',
          currency: 'usd'
        };
      case 'paymentIntent':
        return {
          amount: 2000,
          currency: 'usd',
          status: 'succeeded'
        };
      case 'charge':
        return {
          amount: 1500,
          currency: 'usd',
          paid: true,
          status: 'succeeded'
        };
      case 'subscription':
        return {
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 2592000
        };
      case 'invoice':
        return {
          amount_due: 3000,
          currency: 'usd',
          status: 'paid'
        };
      default:
        return {};
    }
  }
}
