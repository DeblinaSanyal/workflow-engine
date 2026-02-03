import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class TwilioNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'twilio',
    displayName: 'Twilio',
    description: 'Send SMS and make voice calls via Twilio',
    icon: '📱',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'accountSid',
        displayName: 'Account SID',
        type: 'credentials',
        required: true,
        placeholder: 'AC...',
        description: 'Twilio Account SID'
      },
      {
        name: 'authToken',
        displayName: 'Auth Token',
        type: 'credentials',
        required: true,
        description: 'Twilio Auth Token'
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'sendSms',
        options: [
          { name: 'Send SMS', value: 'sendSms' },
          { name: 'Make Call', value: 'makeCall' },
          { name: 'Send WhatsApp', value: 'sendWhatsApp' }
        ],
        description: 'Operation to perform'
      },
      {
        name: 'from',
        displayName: 'From',
        type: 'string',
        required: true,
        placeholder: '+1234567890',
        description: 'Twilio phone number (E.164 format)'
      },
      {
        name: 'to',
        displayName: 'To',
        type: 'string',
        required: true,
        placeholder: '+1987654321',
        description: 'Recipient phone number (E.164 format)'
      },
      {
        name: 'message',
        displayName: 'Message',
        type: 'string',
        placeholder: 'Your verification code is 123456',
        description: 'Message body (for SMS/WhatsApp)'
      },
      {
        name: 'twimlUrl',
        displayName: 'TwiML URL',
        type: 'string',
        placeholder: 'https://demo.twilio.com/docs/voice.xml',
        description: 'TwiML URL for voice calls'
      },
      {
        name: 'mediaUrl',
        displayName: 'Media URL',
        type: 'string',
        placeholder: 'https://example.com/image.jpg',
        description: 'Media URL for MMS'
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
      const operation = this.getParameter<string>(context, 'operation');
      const from = this.getParameter<string>(context, 'from');
      const to = this.getParameter<string>(context, 'to');
      const message = this.getParameter<string>(context, 'message');
      const twimlUrl = this.getParameter<string>(context, 'twimlUrl');
      const mediaUrl = this.getParameter<string>(context, 'mediaUrl');

      context.log.info(`Performing ${operation} via Twilio...`);

      // Mock implementation
      let mockResponse: any = {
        operation,
        from,
        to,
        status: 'queued',
        sid: `SM${Date.now()}`,
        dateCreated: new Date().toISOString()
      };

      switch (operation) {
        case 'sendSms':
          mockResponse.body = message;
          mockResponse.numSegments = 1;
          mockResponse.direction = 'outbound-api';
          if (mediaUrl) {
            mockResponse.numMedia = 1;
            mockResponse.mediaUrl = [mediaUrl];
          }
          break;
        case 'makeCall':
          mockResponse.sid = `CA${Date.now()}`;
          mockResponse.duration = null;
          mockResponse.url = twimlUrl;
          break;
        case 'sendWhatsApp':
          mockResponse.body = message;
          mockResponse.from = `whatsapp:${from}`;
          mockResponse.to = `whatsapp:${to}`;
          break;
      }

      context.log.info(`Twilio ${operation} initiated successfully`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('Twilio operation failed', error);
      return this.error(`Twilio error: ${error.message}`, error);
    }
  }
}
