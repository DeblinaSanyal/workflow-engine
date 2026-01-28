import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class SendEmailNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sendEmail',
    displayName: 'Send Email',
    description: 'Send emails via SMTP',
    icon: '📧',
    category: 'action',
    version: 1,
    parameters: [
      {
        name: 'to',
        displayName: 'To',
        type: 'string',
        required: true,
        placeholder: 'recipient@example.com',
        description: 'Recipient email address'
      },
      {
        name: 'subject',
        displayName: 'Subject',
        type: 'string',
        required: true,
        placeholder: 'Workflow Notification',
        description: 'Email subject'
      },
      {
        name: 'body',
        displayName: 'Body',
        type: 'string',
        required: true,
        placeholder: 'Your workflow has completed...',
        description: 'Email body content'
      },
      {
        name: 'cc',
        displayName: 'CC',
        type: 'string',
        placeholder: 'cc@example.com',
        description: 'CC recipients (comma-separated)'
      },
      {
        name: 'bcc',
        displayName: 'BCC',
        type: 'string',
        placeholder: 'bcc@example.com',
        description: 'BCC recipients (comma-separated)'
      },
      {
        name: 'html',
        displayName: 'HTML Email',
        type: 'boolean',
        default: false,
        description: 'Send as HTML email'
      },
      {
        name: 'attachments',
        displayName: 'Attachments',
        type: 'json',
        description: 'Array of attachment objects'
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
      const to = this.getParameter<string>(context, 'to');
      const subject = this.getParameter<string>(context, 'subject');
      const body = this.getParameter<string>(context, 'body');
      const cc = this.getParameter<string>(context, 'cc');
      const bcc = this.getParameter<string>(context, 'bcc');
      const html = this.getParameter<boolean>(context, 'html');
      const attachments = this.getParameter<any>(context, 'attachments');

      context.log.info(`Sending email to ${to}...`);

      // Mock implementation - replace with actual email service (nodemailer, SendGrid, etc.)
      const mockResponse = {
        messageId: `msg_${Date.now()}`,
        to,
        subject,
        status: 'sent',
        sentAt: new Date().toISOString(),
        provider: 'SMTP',
        details: {
          accepted: [to],
          rejected: [],
          cc: cc ? cc.split(',').map(e => e.trim()) : [],
          bcc: bcc ? bcc.split(',').map(e => e.trim()) : [],
          isHtml: html,
          attachmentCount: attachments ? attachments.length : 0
        }
      };

      context.log.info(`Email sent successfully to ${to}`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Email sending failed', error);
      return this.error(`Email error: ${error.message}`, error);
    }
  }
}
