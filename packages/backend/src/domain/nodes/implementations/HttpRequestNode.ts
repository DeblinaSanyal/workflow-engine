import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class HttpRequestNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'httpRequest',
    displayName: 'HTTP Request',
    description: 'Make HTTP requests to any URL',
    icon: '🌐',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'method',
        displayName: 'Method',
        type: 'options',
        required: true,
        default: 'GET',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' }
        ],
        description: 'HTTP method to use'
      },
      {
        name: 'url',
        displayName: 'URL',
        type: 'string',
        required: true,
        placeholder: 'https://api.example.com/endpoint',
        description: 'The URL to make the request to'
      },
      {
        name: 'headers',
        displayName: 'Headers',
        type: 'json',
        default: {},
        description: 'Request headers as JSON object'
      },
      {
        name: 'body',
        displayName: 'Body',
        type: 'json',
        description: 'Request body (for POST, PUT, PATCH)'
      },
      {
        name: 'timeout',
        displayName: 'Timeout (ms)',
        type: 'number',
        default: 30000,
        description: 'Request timeout in milliseconds'
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
      const method = this.getParameter<string>(context, 'method');
      const url = this.getParameter<string>(context, 'url');
      const headers = this.getParameter<Record<string, any>>(context, 'headers') || {};
      const body = this.getParameter<any>(context, 'body');
      const timeout = this.getParameter<number>(context, 'timeout');

      context.log.info(`Making ${method} request to ${url}`);

      const config: AxiosRequestConfig = {
        method,
        url,
        headers,
        timeout
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = body;
      }

      const response: AxiosResponse = await axios(config);

      context.log.info(`Request completed with status ${response.status}`);

      return this.success({
        statusCode: response.status,
        headers: response.headers,
        body: response.data
      });
    } catch (error: any) {
      context.log.error('HTTP request failed', error);
      
      if (error.response) {
        // Request was made and server responded with error status
        return this.error(
          `HTTP ${error.response.status}: ${error.response.statusText}`,
          error
        );
      } else if (error.request) {
        // Request was made but no response received
        return this.error('No response received from server', error);
      } else {
        // Something else happened
        return this.error(error.message, error);
      }
    }
  }
}
