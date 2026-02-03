import axios, { AxiosInstance } from 'axios';

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutput?: string;
  targetNodeId: string;
  targetInput?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings?: any;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ERROR';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'CANCELLED' | 'WAITING';
  mode: 'MANUAL' | 'TRIGGER' | 'SCHEDULED' | 'WEBHOOK';
  startedAt?: string;
  finishedAt?: string;
  executionTime?: number;
  nodeExecutions: any[];
  triggerData?: any;
  errorMessage?: string;
  createdAt: string;
}

export interface NodeMetadata {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  category: 'trigger' | 'action' | 'transform' | 'control' | 'integration';
  version: number;
  parameters: any[];
  inputs: any[];
  outputs: any[];
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Workflows
  async getWorkflows(params?: { limit?: number; offset?: number; status?: string }) {
    const response = await this.client.get<{ success: boolean; data: Workflow[]; pagination: any }>('/workflows', { params });
    return response.data;
  }

  async getWorkflow(id: string) {
    const response = await this.client.get<{ success: boolean; data: Workflow }>(`/workflows/${id}`);
    return response.data.data;
  }

  async createWorkflow(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await this.client.post<{ success: boolean; data: Workflow }>('/workflows', data);
    return response.data.data;
  }

  async updateWorkflow(id: string, data: Partial<Workflow>) {
    const response = await this.client.put<{ success: boolean; data: Workflow }>(`/workflows/${id}`, data);
    return response.data.data;
  }

  async deleteWorkflow(id: string) {
    await this.client.delete(`/workflows/${id}`);
  }

  async activateWorkflow(id: string) {
    const response = await this.client.post<{ success: boolean; data: Workflow }>(`/workflows/${id}/activate`);
    return response.data.data;
  }

  async deactivateWorkflow(id: string) {
    const response = await this.client.post<{ success: boolean; data: Workflow }>(`/workflows/${id}/deactivate`);
    return response.data.data;
  }

  // Executions
  async executeWorkflow(workflowId: string, data?: { triggerData?: any; mode?: string }) {
    const response = await this.client.post<{ success: boolean; data: WorkflowExecution }>(
      `/workflows/${workflowId}/execute`,
      data
    );
    return response.data.data;
  }

  async getExecution(id: string) {
    const response = await this.client.get<{ success: boolean; data: WorkflowExecution }>(`/executions/${id}`);
    return response.data.data;
  }

  async getWorkflowExecutions(workflowId: string, params?: { limit?: number; offset?: number }) {
    const response = await this.client.get<{ success: boolean; data: WorkflowExecution[]; pagination: any }>(
      `/workflows/${workflowId}/executions`,
      { params }
    );
    return response.data;
  }

  async getRecentExecutions(limit: number = 10) {
    const response = await this.client.get<{ success: boolean; data: WorkflowExecution[] }>(
      '/executions/recent',
      { params: { limit } }
    );
    return response.data.data;
  }

  // Node types
  async getNodeTypes() {
    const response = await this.client.get<{ success: boolean; data: NodeMetadata[] }>('/nodes');
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
