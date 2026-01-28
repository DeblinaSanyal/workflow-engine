import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
import axios from 'axios';

export class OpenAiNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'openAiChat',
    displayName: 'OpenAI Chat',
    description: 'Generate AI responses using OpenAI GPT models',
    icon: '🤖',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'apiKey',
        displayName: 'API Key',
        type: 'credentials',
        required: true,
        description: 'OpenAI API key'
      },
      {
        name: 'model',
        displayName: 'Model',
        type: 'options',
        required: true,
        default: 'gpt-4',
        options: [
          { name: 'GPT-4', value: 'gpt-4' },
          { name: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
          { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
        ],
        description: 'OpenAI model to use'
      },
      {
        name: 'prompt',
        displayName: 'Prompt',
        type: 'string',
        required: true,
        placeholder: 'Analyze this customer feedback...',
        description: 'Prompt for the AI'
      },
      {
        name: 'systemMessage',
        displayName: 'System Message',
        type: 'string',
        placeholder: 'You are a helpful assistant...',
        description: 'System role instruction'
      },
      {
        name: 'temperature',
        displayName: 'Temperature',
        type: 'number',
        default: 0.7,
        description: 'Creativity level (0-2)'
      },
      {
        name: 'maxTokens',
        displayName: 'Max Tokens',
        type: 'number',
        default: 500,
        description: 'Maximum response length'
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
      const apiKey = this.getParameter<string>(context, 'apiKey');
      const model = this.getParameter<string>(context, 'model');
      const prompt = this.getParameter<string>(context, 'prompt');
      const systemMessage = this.getParameter<string>(context, 'systemMessage');
      const temperature = this.getParameter<number>(context, 'temperature');
      const maxTokens = this.getParameter<number>(context, 'maxTokens');

      context.log.info(`Calling OpenAI ${model}...`);

      // Mock implementation - replace with actual OpenAI API call
      const mockResponse = {
        model,
        choices: [
          {
            message: {
              role: 'assistant',
              content: `[Mock AI Response]\n\nBased on the prompt: "${prompt}"\n\nThis is a simulated AI response. In production, this would call the actual OpenAI API and return a real AI-generated response tailored to your prompt.`
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 45,
          total_tokens: 95
        }
      };

      context.log.info('OpenAI response received');

      return this.success({
        model,
        response: mockResponse.choices[0].message.content,
        usage: mockResponse.usage,
        temperature,
        maxTokens
      });
    } catch (error: any) {
      context.log.error('OpenAI API call failed', error);
      return this.error(`OpenAI error: ${error.message}`, error);
    }
  }
}
