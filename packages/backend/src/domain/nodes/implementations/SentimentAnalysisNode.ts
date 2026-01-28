import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class SentimentAnalysisNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'sentimentAnalysis',
    displayName: 'Sentiment Analysis',
    description: 'Analyze sentiment of text (positive, negative, neutral)',
    icon: '😊',
    category: 'transform',
    version: 1,
    parameters: [
      {
        name: 'text',
        displayName: 'Text to Analyze',
        type: 'string',
        required: true,
        placeholder: 'I love this product! It works great.',
        description: 'Text for sentiment analysis'
      },
      {
        name: 'includeEmotions',
        displayName: 'Include Emotions',
        type: 'boolean',
        default: true,
        description: 'Detect specific emotions (joy, anger, sadness, etc.)'
      },
      {
        name: 'language',
        displayName: 'Language',
        type: 'options',
        default: 'en',
        options: [
          { name: 'English', value: 'en' },
          { name: 'German', value: 'de' },
          { name: 'Spanish', value: 'es' },
          { name: 'French', value: 'fr' }
        ],
        description: 'Text language'
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
      const text = this.getParameter<string>(context, 'text');
      const includeEmotions = this.getParameter<boolean>(context, 'includeEmotions');
      const language = this.getParameter<string>(context, 'language');

      context.log.info('Analyzing sentiment...');

      // Simple mock sentiment analysis
      // In production, use NLP libraries or AI APIs
      const positiveWords = ['love', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
      const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'poor', 'horrible'];
      
      const lowerText = text.toLowerCase();
      const hasPositive = positiveWords.some(word => lowerText.includes(word));
      const hasNegative = negativeWords.some(word => lowerText.includes(word));
      
      let sentiment = 'neutral';
      let score = 0;
      
      if (hasPositive && !hasNegative) {
        sentiment = 'positive';
        score = 0.8;
      } else if (hasNegative && !hasPositive) {
        sentiment = 'negative';
        score = -0.7;
      } else if (hasPositive && hasNegative) {
        sentiment = 'mixed';
        score = 0.1;
      }

      const result: any = {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        sentiment,
        score,
        confidence: 0.85,
        language
      };

      if (includeEmotions) {
        result.emotions = {
          joy: hasPositive ? 0.8 : 0.2,
          anger: hasNegative ? 0.7 : 0.1,
          sadness: hasNegative ? 0.6 : 0.1,
          surprise: 0.3,
          fear: 0.1
        };
      }

      context.log.info(`Sentiment: ${sentiment} (score: ${score})`);

      return this.success(result);
    } catch (error: any) {
      context.log.error('Sentiment analysis failed', error);
      return this.error(`Sentiment analysis error: ${error.message}`, error);
    }
  }
}
