import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
import axios from 'axios';

export class ClaudeAiNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'claudeAi',
    displayName: 'Claude AI',
    description: 'Generate AI responses using Anthropic Claude',
    icon: '🧠',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'apiKey',
        displayName: 'API Key',
        type: 'credentials',
        required: true,
        description: 'Anthropic API key'
      },
      {
        name: 'model',
        displayName: 'Model',
        type: 'options',
        required: true,
        default: 'claude-3-5-sonnet-20241022',
        options: [
          { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
          { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
          { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' }
        ],
        description: 'Claude model to use'
      },
      {
        name: 'prompt',
        displayName: 'Prompt',
        type: 'string',
        required: true,
        placeholder: 'Analyze this business process...',
        description: 'Prompt for Claude'
      },
      {
        name: 'systemPrompt',
        displayName: 'System Prompt',
        type: 'string',
        placeholder: 'You are an expert business analyst...',
        description: 'System instructions for Claude'
      },
      {
        name: 'maxTokens',
        displayName: 'Max Tokens',
        type: 'number',
        default: 1024,
        description: 'Maximum response length'
      },
      {
        name: 'temperature',
        displayName: 'Temperature',
        type: 'number',
        default: 1.0,
        description: 'Creativity level (0-1)'
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
      const systemPrompt = this.getParameter<string>(context, 'systemPrompt');
      const maxTokens = this.getParameter<number>(context, 'maxTokens');
      const temperature = this.getParameter<number>(context, 'temperature');

      context.log.info(`Calling Claude AI ${model}...`);

      // Mock implementation - replace with actual Anthropic API call
      const mockResponse = {
        id: `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: `[Mock Claude Response]\n\nAnalyzing your request: "${prompt}"\n\nThis is a simulated Claude AI response. In production, this would call the actual Anthropic API with sophisticated reasoning capabilities. Claude excels at analysis, coding, and complex problem-solving.`
          }
        ],
        model,
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 45,
          output_tokens: 85
        }
      };

      context.log.info('Claude AI response received');

      return this.success({
        model,
        response: mockResponse.content[0].text,
        usage: mockResponse.usage,
        messageId: mockResponse.id
      });
    } catch (error: any) {
      context.log.error('Claude AI API call failed', error);
      return this.error(`Claude AI error: ${error.message}`, error);
    }
  }
}
