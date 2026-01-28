import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class ConditionalNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'conditional',
    displayName: 'If Condition',
    description: 'Route workflow based on conditions',
    icon: '🔀',
    category: 'control',
    version: 1,
    parameters: [
      {
        name: 'condition',
        displayName: 'Condition',
        type: 'string',
        required: true,
        placeholder: 'input.value > 100',
        description: 'JavaScript condition that returns true or false'
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
        name: 'true',
        displayName: 'True',
        type: 'any'
      },
      {
        name: 'false',
        displayName: 'False',
        type: 'any'
      }
    ]
  };

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const condition = this.getParameter<string>(context, 'condition');
      const input = context.inputData.default;

      context.log.info('Evaluating condition');

      // Create a safe evaluation context
      const fn = new Function('input', `return ${condition}`);
      
      // Evaluate the condition
      const result = fn(input);

      if (typeof result !== 'boolean') {
        throw new Error('Condition must return a boolean value');
      }

      context.log.info(`Condition evaluated to: ${result}`);

      // Return data with output routing info
      return this.success({
        value: input,
        routeTo: result ? 'true' : 'false',
        conditionResult: result
      });
    } catch (error: any) {
      context.log.error('Condition evaluation failed', error);
      return this.error(`Condition error: ${error.message}`, error);
    }
  }
}
