import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';

export class GitHubNode extends BaseNode {
  readonly metadata: NodeMetadata = {
    name: 'github',
    displayName: 'GitHub',
    description: 'Interact with GitHub repositories, issues, and pull requests',
    icon: '🐙',
    category: 'integration',
    version: 1,
    parameters: [
      {
        name: 'token',
        displayName: 'Personal Access Token',
        type: 'credentials',
        required: true,
        description: 'GitHub Personal Access Token'
      },
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'issue',
        options: [
          { name: 'Issue', value: 'issue' },
          { name: 'Pull Request', value: 'pullRequest' },
          { name: 'Repository', value: 'repository' },
          { name: 'Comment', value: 'comment' }
        ],
        description: 'GitHub resource type'
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'get',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'List', value: 'list' }
        ],
        description: 'Operation to perform'
      },
      {
        name: 'owner',
        displayName: 'Owner',
        type: 'string',
        required: true,
        placeholder: 'octocat',
        description: 'Repository owner (username or organization)'
      },
      {
        name: 'repo',
        displayName: 'Repository',
        type: 'string',
        required: true,
        placeholder: 'hello-world',
        description: 'Repository name'
      },
      {
        name: 'issueNumber',
        displayName: 'Issue/PR Number',
        type: 'number',
        placeholder: '42',
        description: 'Issue or Pull Request number'
      },
      {
        name: 'title',
        displayName: 'Title',
        type: 'string',
        placeholder: 'Bug: Application crashes on startup',
        description: 'Issue or PR title'
      },
      {
        name: 'body',
        displayName: 'Body',
        type: 'string',
        placeholder: 'Description of the issue...',
        description: 'Issue, PR, or comment body'
      },
      {
        name: 'labels',
        displayName: 'Labels',
        type: 'string',
        placeholder: 'bug,high-priority',
        description: 'Comma-separated labels'
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
      const resource = this.getParameter<string>(context, 'resource');
      const operation = this.getParameter<string>(context, 'operation');
      const owner = this.getParameter<string>(context, 'owner');
      const repo = this.getParameter<string>(context, 'repo');
      const issueNumber = this.getParameter<number>(context, 'issueNumber');
      const title = this.getParameter<string>(context, 'title');
      const body = this.getParameter<string>(context, 'body');
      const labels = this.getParameter<string>(context, 'labels');

      context.log.info(`Performing ${operation} on GitHub ${resource}...`);

      // Mock implementation
      let mockResponse: any = {
        resource,
        operation,
        repository: `${owner}/${repo}`,
        executedAt: new Date().toISOString()
      };

      switch (operation) {
        case 'get':
          mockResponse.data = {
            id: issueNumber || 1,
            number: issueNumber || 1,
            title: title || 'Sample Issue',
            body: body || 'This is a sample issue',
            state: 'open',
            user: { login: owner },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            html_url: `https://github.com/${owner}/${repo}/issues/${issueNumber || 1}`
          };
          break;
        case 'create':
          mockResponse.data = {
            id: Date.now(),
            number: Math.floor(Math.random() * 1000),
            title,
            body,
            state: 'open',
            labels: labels ? labels.split(',').map(l => ({ name: l.trim() })) : [],
            created_at: new Date().toISOString(),
            html_url: `https://github.com/${owner}/${repo}/issues/${Math.floor(Math.random() * 1000)}`
          };
          break;
        case 'update':
          mockResponse.data = {
            id: issueNumber,
            number: issueNumber,
            title,
            body,
            updated_at: new Date().toISOString()
          };
          break;
        case 'list':
          mockResponse.data = [
            {
              number: 1,
              title: 'First Issue',
              state: 'open',
              created_at: new Date().toISOString()
            },
            {
              number: 2,
              title: 'Second Issue',
              state: 'closed',
              created_at: new Date().toISOString()
            }
          ];
          break;
      }

      context.log.info(`GitHub ${operation} on ${resource} completed successfully`);

      return this.success(mockResponse);
    } catch (error: any) {
      context.log.error('GitHub operation failed', error);
      return this.error(`GitHub error: ${error.message}`, error);
    }
  }
}
