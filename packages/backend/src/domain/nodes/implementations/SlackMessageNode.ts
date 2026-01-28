import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
import axios from 'axios';

export class SlackMessageNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'slackMessage',
    displayName: 'Slack Message',
    description: 'Send messages to Slack channels',
    icon: '💬',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'webhookUrl',
        displayName: 'Webhook URL',
        type: 'credentials',
        required: true,
        placeholder: 'https://hooks.slack.com/services/...',
        description: 'Slack webhook URL'
      },
      {
        name: 'channel',
        displayName: 'Channel',
        type: 'string',
        placeholder: '#general',
        description: 'Slack channel name'
      },
      {
        name: 'message',
        displayName: 'Message',
        type: 'string',
        required: true,
        placeholder: 'Workflow completed successfully!',
        description: 'Message to send'
      },
      {
        name: 'username',
        displayName: 'Bot Username',
        type: 'string',
        default: 'Workflow Bot',
        description: 'Display name for the bot'
      },
      {
        name: 'iconEmoji',
        displayName: 'Icon Emoji',
        type: 'string',
        placeholder: ':robot_face:',
        description: 'Emoji icon for bot'
      },
      {
        name: 'attachments',
        displayName: 'Attachments',
        type: 'json',
        description: 'Slack message attachments (JSON array)'
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
      const channel = this.getParameter<string>(context, 'channel');
      const message = this.getParameter<string>(context, 'message');
      const username = this.getParameter<string>(context, 'username');
      const iconEmoji = this.getParameter<string>(context, 'iconEmoji');
      const attachments = this.getParameter<any>(context, 'attachments');

      context.log.info(`Sending Slack message to ${channel || 'default channel'}...`);

      // Mock implementation - replace with actual Slack API call
      const mockResponse = {
        ok: true,
        channel: channel || '#general',
        ts: `${Date.now()}`,
        message: {
          text: message,
          username,
          icon_emoji: iconEmoji,
          attachments: attachments || []
        }
      };

      context.log.info('Slack message sent successfully');

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Slack message failed', error);
      return this.error(`Slack error: ${error.message}`, error);
    }
  }
}
