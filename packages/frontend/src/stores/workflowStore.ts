import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { Workflow, WorkflowNode, WorkflowConnection, NodeMetadata } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

// History state for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY_SIZE = 50;

interface WorkflowStore {
  // Workflow metadata
  workflowId?: string;
  workflowName: string;
  workflowDescription?: string;
  workflowStatus: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  
  // Flow state
  nodes: Node[];
  edges: Edge[];
  
  // Available node types
  nodeTypes: NodeMetadata[];
  
  // UI state
  selectedNode: Node | null;
  
  // Clipboard
  clipboard: Node[];
  
  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;
  
  // Actions
  setWorkflow: (workflow: Workflow) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  setNodeTypes: (types: NodeMetadata[]) => void;
  
  addNode: (type: string, position: { x: number; y: number }) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  
  setSelectedNode: (node: Node | null) => void;
  
  // Clipboard operations
  copySelectedNodes: () => void;
  pasteNodes: () => void;
  duplicateSelectedNodes: () => void;
  
  // Selection operations
  selectAllNodes: () => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Convert to API format
  toWorkflowData: () => Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Reset
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowName: 'Untitled Workflow',
  workflowStatus: 'INACTIVE',
  nodes: [],
  edges: [],
  nodeTypes: [],
  selectedNode: null,
  clipboard: [],
  history: [],
  historyIndex: -1,

  setWorkflow: (workflow) => {
    // Convert workflow nodes to React Flow nodes
    const nodes: Node[] = workflow.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        type: node.type,
        name: node.name,
        parameters: node.parameters
      }
    }));

    // Convert connections to React Flow edges
    const edges: Edge[] = workflow.connections.map(conn => ({
      id: conn.id,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      sourceHandle: conn.sourceOutput || 'default',
      targetHandle: conn.targetInput || 'default'
    }));

    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description,
      workflowStatus: workflow.status,
      nodes,
      edges
    });
  },

  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  setNodeTypes: (types) => set({ nodeTypes: types }),

  addNode: (type, position) => {
    const nodeType = get().nodeTypes.find(nt => nt.name === type);
    if (!nodeType) return;

    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position,
      data: {
        type: nodeType.name,
        name: nodeType.displayName,
        parameters: {},
        metadata: nodeType
      }
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, id: uuidv4() }, get().edges)
    });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  // Save current state to history for undo/redo
  saveToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    
    // Remove any future history states if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add current state to history
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    
    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // Copy selected nodes to clipboard
  copySelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    
    if (selectedNodes.length === 0) return;
    
    // Deep copy the selected nodes
    const copiedNodes = JSON.parse(JSON.stringify(selectedNodes));
    
    set({ clipboard: copiedNodes });
  },

  // Paste nodes from clipboard
  pasteNodes: () => {
    const { clipboard, nodes, edges, nodeTypes } = get();
    
    if (clipboard.length === 0) return;
    
    // Save current state before pasting
    get().saveToHistory();
    
    // Create new nodes with new IDs and offset positions
    const idMapping: Record<string, string> = {};
    const offset = { x: 50, y: 50 };
    
    const newNodes: Node[] = clipboard.map((node) => {
      const newId = uuidv4();
      idMapping[node.id] = newId;
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        selected: true, // Select the pasted nodes
      };
    });
    
    // Deselect all existing nodes
    const updatedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));
    
    // Find edges that connect the copied nodes and recreate them
    const selectedNodeIds = new Set(clipboard.map((n) => n.id));
    const relevantEdges = edges.filter(
      (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );
    
    const newEdges: Edge[] = relevantEdges.map((edge) => ({
      ...edge,
      id: uuidv4(),
      source: idMapping[edge.source],
      target: idMapping[edge.target],
    }));
    
    set({
      nodes: [...updatedNodes, ...newNodes],
      edges: [...edges, ...newEdges],
    });
    
    // Update clipboard with new positions for subsequent pastes
    set({
      clipboard: clipboard.map((node) => ({
        ...node,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
      })),
    });
  },

  // Duplicate selected nodes in place
  duplicateSelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    
    if (selectedNodes.length === 0) return;
    
    // Save current state before duplicating
    get().saveToHistory();
    
    // Create new nodes with new IDs and offset positions
    const idMapping: Record<string, string> = {};
    const offset = { x: 50, y: 50 };
    
    const newNodes: Node[] = selectedNodes.map((node) => {
      const newId = uuidv4();
      idMapping[node.id] = newId;
      
      return {
        ...JSON.parse(JSON.stringify(node)),
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        selected: true,
      };
    });
    
    // Deselect original nodes
    const updatedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));
    
    // Find edges that connect the selected nodes and recreate them
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const relevantEdges = edges.filter(
      (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );
    
    const newEdges: Edge[] = relevantEdges.map((edge) => ({
      ...edge,
      id: uuidv4(),
      source: idMapping[edge.source],
      target: idMapping[edge.target],
    }));
    
    set({
      nodes: [...updatedNodes, ...newNodes],
      edges: [...edges, ...newEdges],
    });
  },

  // Select all nodes
  selectAllNodes: () => {
    const { nodes } = get();
    
    const updatedNodes = nodes.map((node) => ({
      ...node,
      selected: true,
    }));
    
    set({ nodes: updatedNodes });
  },

  // Undo last action
  undo: () => {
    const { history, historyIndex, nodes, edges } = get();
    
    if (historyIndex < 0) return;
    
    // If this is the first undo, save current state first
    if (historyIndex === history.length - 1) {
      const newHistory = [...history, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      set({
        history: newHistory,
        historyIndex: historyIndex,
      });
    }
    
    const previousState = history[historyIndex];
    
    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      historyIndex: historyIndex - 1,
      selectedNode: null,
    });
  },

  // Redo last undone action
  redo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 2] || history[historyIndex + 1];
    
    if (!nextState) return;
    
    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      historyIndex: historyIndex + 1,
      selectedNode: null,
    });
  },

  toWorkflowData: () => {
    const state = get();
    
    const nodes: WorkflowNode[] = state.nodes.map(node => ({
      id: node.id,
      type: node.data.type,
      name: node.data.name,
      parameters: node.data.parameters || {},
      position: node.position
    }));

    const connections: WorkflowConnection[] = state.edges.map(edge => ({
      id: edge.id,
      sourceNodeId: edge.source,
      sourceOutput: edge.sourceHandle || 'default',
      targetNodeId: edge.target,
      targetInput: edge.targetHandle || 'default'
    }));

    return {
      name: state.workflowName,
      description: state.workflowDescription,
      nodes,
      connections,
      status: state.workflowStatus
    };
  },

  reset: () => set({
    workflowId: undefined,
    workflowName: 'Untitled Workflow',
    workflowDescription: undefined,
    workflowStatus: 'INACTIVE',
    nodes: [],
    edges: [],
    selectedNode: null,
    clipboard: [],
    history: [],
    historyIndex: -1,
  })
}));
