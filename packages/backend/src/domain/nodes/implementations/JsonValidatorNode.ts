import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class JsonValidatorNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'jsonValidator',
    displayName: 'JSON Schema Validator',
    description: 'Validate JSON against a schema',
    icon: '✅',
    category: 'transform',
    version: 1,
    parameters: [
      {
        name: 'jsonData',
        displayName: 'JSON Data',
        type: 'json',
        required: true,
        description: 'JSON data to validate'
      },
      {
        name: 'schema',
        displayName: 'JSON Schema',
        type: 'json',
        required: true,
        placeholder: '{"type": "object", "properties": {"name": {"type": "string"}}}',
        description: 'JSON Schema for validation'
      },
      {
        name: 'strictMode',
        displayName: 'Strict Mode',
        type: 'boolean',
        default: true,
        description: 'Reject additional properties'
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
        name: 'valid',
        displayName: 'Valid',
        type: 'any'
      },
      {
        name: 'invalid',
        displayName: 'Invalid',
        type: 'any'
      }
    ]
  };

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const jsonData = this.getParameter<any>(context, 'jsonData');
      const schema = this.getParameter<any>(context, 'schema');
      const strictMode = this.getParameter<boolean>(context, 'strictMode');

      context.log.info('Validating JSON data...');

      // Simple validation - in production use ajv or similar library
      const errors: string[] = [];
      let isValid = true;

      // Basic type checking
      if (schema.type && typeof jsonData !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${typeof jsonData}`);
        isValid = false;
      }

      // Check required properties
      if (schema.required && Array.isArray(schema.required)) {
        for (const required of schema.required) {
          if (!(required in jsonData)) {
            errors.push(`Missing required property: ${required}`);
            isValid = false;
          }
        }
      }

      // Check property types
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in jsonData) {
            const propType = (propSchema as any).type;
            if (propType && typeof jsonData[key] !== propType) {
              errors.push(`Property ${key}: expected ${propType}, got ${typeof jsonData[key]}`);
              isValid = false;
            }
          }
        }
      }

      const result = {
        valid: isValid,
        errors: isValid ? [] : errors,
        data: jsonData,
        schema,
        validatedAt: new Date().toISOString(),
        routeTo: isValid ? 'valid' : 'invalid'
      };

      context.log.info(isValid ? 'Validation passed' : `Validation failed: ${errors.length} errors`);

      return this.success(result);
    } catch (error: any) {
      context.log.error('JSON validation failed', error);
      return this.error(`Validation error: ${error.message}`, error);
    }
  }
}
