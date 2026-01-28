import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class DataTransformNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'dataTransform',
    displayName: 'Data Transform',
    description: 'Transform and manipulate data using JavaScript',
    icon: '🔄',
    category: 'transform',
    version: 1,
    parameters: [
      {
        name: 'code',
        displayName: 'JavaScript Code',
        type: 'string',
        required: true,
        placeholder: 'return { result: input.value * 2 }',
        description: 'JavaScript code to transform the data. Input is available as "input" variable.'
      }
    ],
    inputs: [
      {
        name: 'default',
        displayName: 'Input',
        type: 'any',
        required: true
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
      const code = this.getParameter<string>(context, 'code');
      const input = context.inputData.default;

      context.log.info('Executing data transformation');

      // Create a safe execution context
      const fn = new Function('input', 'context', code);
      
      // Execute the transformation
      const result = fn(input, {
        log: context.log,
        getPreviousNodeData: context.getPreviousNodeData
      });

      context.log.info('Data transformation completed');

      return this.success(result);
    } catch (error: any) {
      context.log.error('Data transformation failed', error);
      return this.error(`Transformation error: ${error.message}`, error);
    }
  }
}
