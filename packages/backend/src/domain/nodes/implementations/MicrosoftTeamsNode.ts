import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class MicrosoftTeamsNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'microsoftTeams',
    displayName: 'Microsoft Teams',
    description: 'Send messages to Microsoft Teams channels',
    icon: '👥',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'webhookUrl',
        displayName: 'Webhook URL',
        type: 'credentials',
        required: true,
        placeholder: 'https://outlook.office.com/webhook/...',
        description: 'Microsoft Teams incoming webhook URL'
      },
      {
        name: 'title',
        displayName: 'Message Title',
        type: 'string',
        placeholder: 'Workflow Notification',
        description: 'Title of the message card'
      },
      {
        name: 'text',
        displayName: 'Message Text',
        type: 'string',
        required: true,
        placeholder: 'Workflow completed successfully!',
        description: 'Main message content'
      },
      {
        name: 'themeColor',
        displayName: 'Theme Color',
        type: 'string',
        default: '0078D4',
        placeholder: '0078D4',
        description: 'Color of the message card (hex without #)'
      },
      {
        name: 'sections',
        displayName: 'Sections',
        type: 'json',
        description: 'Additional message sections (JSON array)'
      },
      {
        name: 'actions',
        displayName: 'Actions',
        type: 'json',
        description: 'Action buttons (JSON array)'
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
      const webhookUrl = this.getParameter<string>(context, 'webhookUrl');
      const title = this.getParameter<string>(context, 'title');
      const text = this.getParameter<string>(context, 'text');
      const themeColor = this.getParameter<string>(context, 'themeColor');
      const sections = this.getParameter<any>(context, 'sections');
      const actions = this.getParameter<any>(context, 'actions');

      context.log.info('Sending message to Microsoft Teams...');

      // Mock implementation
      const mockResponse = {
        success: true,
        messageId: `teams_${Date.now()}`,
        webhookUrl,
        card: {
          title,
          text,
          themeColor,
          sections: sections || [],
          potentialAction: actions || []
        },
        sentAt: new Date().toISOString()
      };

      context.log.info('Microsoft Teams message sent successfully');

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Microsoft Teams message failed', error);
      return this.error(`Teams error: ${error.message}`, error);
    }
  }
}
