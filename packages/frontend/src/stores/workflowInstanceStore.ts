import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { PendingEdge } from './workflowStore';
import { Workflow, NodeMetadata } from '../services/api';

// Represents the state of a single workflow instance
export interface WorkflowInstance {
  tabId: string;
  workflowId?: string;
  workflowName: string;
  workflowDescription?: string;
  workflowStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ERROR';
  nodes: Node[];
  edges: Edge[];
  pendingEdges: PendingEdge[];
  selectedNode: Node | null;
  clipboard: Node[];
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;
}

interface WorkflowInstanceStore {
  instances: Map<string, WorkflowInstance>;
  
  // Instance management
  createInstance: (tabId: string, workflow?: Workflow) => void;
  deleteInstance: (tabId: string) => void;
  getInstance: (tabId: string) => WorkflowInstance | undefined;
  
  // Instance state updates
  updateInstance: (tabId: string, updates: Partial<WorkflowInstance>) => void;
  updateNodes: (tabId: string, nodes: Node[]) => void;
  updateEdges: (tabId: string, edges: Edge[]) => void;
  updatePendingEdges: (tabId: string, pendingEdges: PendingEdge[]) => void;
  
  // Convert instance to Workflow format
  toWorkflowData: (tabId: string) => Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> | null;
}

const createEmptyInstance = (tabId: string): WorkflowInstance => ({
  tabId,
  workflowName: 'Untitled Workflow',
  workflowStatus: 'DRAFT',
  nodes: [],
  edges: [],
  pendingEdges: [],
  selectedNode: null,
  clipboard: [],
  history: [],
  historyIndex: -1
});

const workflowToInstance = (tabId: string, workflow: Workflow): WorkflowInstance => {
  // Convert Workflow format to ReactFlow format
  const nodes: Node[] = workflow.nodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      type: node.type,
      name: node.name,
      parameters: node.parameters,
      metadata: {} as NodeMetadata // Will be filled by the component
    }
  }));

  const edges: Edge[] = workflow.connections.map(conn => ({
    id: conn.id,
    source: conn.sourceNodeId,
    target: conn.targetNodeId,
    sourceHandle: conn.sourceOutput || 'default',
    targetHandle: conn.targetInput || 'default'
  }));

  return {
    tabId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    workflowDescription: workflow.description,
    workflowStatus: workflow.status,
    nodes,
    edges,
    pendingEdges: [],
    selectedNode: null,
    clipboard: [],
    history: [],
    historyIndex: -1
  };
};

export const useWorkflowInstanceStore = create<WorkflowInstanceStore>((set, get) => ({
  instances: new Map(),

  createInstance: (tabId, workflow) => {
    const instance = workflow 
      ? workflowToInstance(tabId, workflow)
      : createEmptyInstance(tabId);
    
    const newInstances = new Map(get().instances);
    newInstances.set(tabId, instance);
    set({ instances: newInstances });
  },

  deleteInstance: (tabId) => {
    const newInstances = new Map(get().instances);
    newInstances.delete(tabId);
    set({ instances: newInstances });
  },

  getInstance: (tabId) => {
    return get().instances.get(tabId);
  },

  updateInstance: (tabId, updates) => {
    const instance = get().instances.get(tabId);
    if (!instance) return;

    const newInstances = new Map(get().instances);
    newInstances.set(tabId, { ...instance, ...updates });
    set({ instances: newInstances });
  },

  updateNodes: (tabId, nodes) => {
    get().updateInstance(tabId, { nodes });
  },

  updateEdges: (tabId, edges) => {
    get().updateInstance(tabId, { edges });
  },

  updatePendingEdges: (tabId, pendingEdges) => {
    get().updateInstance(tabId, { pendingEdges });
  },

  toWorkflowData: (tabId) => {
    const instance = get().instances.get(tabId);
    if (!instance) return null;

    return {
      name: instance.workflowName,
      description: instance.workflowDescription,
      status: instance.workflowStatus,
      nodes: instance.nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        name: node.data.name,
        parameters: node.data.parameters || {},
        position: node.position
      })),
      connections: instance.edges.map(edge => ({
        id: edge.id,
        sourceNodeId: edge.source,
        sourceOutput: edge.sourceHandle || 'default',
        targetNodeId: edge.target,
        targetInput: edge.targetHandle || 'default'
      }))
    };
  }
}));
