import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { Workflow, WorkflowNode, WorkflowConnection, NodeMetadata } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

// History state for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

// Pending edge for plus button workflow building
export interface PendingEdge {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  position: { x: number; y: number };
}

const MAX_HISTORY_SIZE = 50;

// Favorites localStorage helpers
const FAVORITES_STORAGE_KEY = 'workflow-favorites';

const loadFavoritesFromStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
  return new Set();
};

const saveFavoritesToStorage = (favorites: Set<string>) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};

interface WorkflowStore {
  // Workflow metadata
  workflowId?: string;
  workflowName: string;
  workflowDescription?: string;
  workflowStatus: 'ACTIVE' | 'INACTIVE' | 'ERROR';

  // Flow state
  nodes: Node[];
  edges: Edge[];

  // Pending edges for plus button workflow building
  pendingEdges: PendingEdge[];

  // Available node types
  nodeTypes: NodeMetadata[];

  // UI state
  selectedNode: Node | null;

  // Clipboard
  clipboard: Node[];

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;

  // Favorites
  favorites: Set<string>;

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

  // Favorites operations
  toggleFavorite: (nodeName: string) => void;
  isFavorite: (nodeName: string) => boolean;
  getFavoriteNodes: () => NodeMetadata[];

  // Pending edges operations
  addNodeFromPendingEdge: (pendingEdgeId: string, nodeType: string) => void;
  removePendingEdge: (pendingEdgeId: string) => void;

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
  pendingEdges: [],
  nodeTypes: [],
  selectedNode: null,
  clipboard: [],
  history: [],
  historyIndex: -1,
  favorites: loadFavoritesFromStorage(),

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
    if (!nodeType) {
      console.warn('[WorkflowStore] Node type not found:', type);
      return;
    }

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

    const newPendingEdges: PendingEdge[] = [];

    // Create pending edges for all output handles if node has outputs
    if (nodeType.outputs && nodeType.outputs.length > 0) {
      console.log('[WorkflowStore] Creating pending edges for outputs:', nodeType.outputs);
      nodeType.outputs.forEach((output, index) => {
        const pendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: {
            x: position.x + 300,
            y: position.y + (index * 60) // Offset each pending edge vertically
          }
        };
        newPendingEdges.push(pendingEdge);
      });
    } else {
      console.log('[WorkflowStore] No outputs found, creating default pending edge');
      // If no outputs metadata, create a single default pending edge
      const pendingEdge: PendingEdge = {
        id: uuidv4(),
        sourceNodeId: newNode.id,
        sourceHandle: 'default',
        position: {
          x: position.x + 300,
          y: position.y
        }
      };
      newPendingEdges.push(pendingEdge);
    }

    console.log('[WorkflowStore] Adding node with pending edges:', {
      node: newNode,
      pendingEdges: newPendingEdges,
      totalPendingEdges: [...get().pendingEdges, ...newPendingEdges].length
    });

    set({
      nodes: [...get().nodes, newNode],
      pendingEdges: [...get().pendingEdges, ...newPendingEdges]
    });
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
    // Remove any pending edge from the source node's source handle
    const updatedPendingEdges = get().pendingEdges.filter(
      pe => !(pe.sourceNodeId === connection.source && pe.sourceHandle === connection.sourceHandle)
    );

    set({
      edges: addEdge({ ...connection, id: uuidv4() }, get().edges),
      pendingEdges: updatedPendingEdges
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
      pendingEdges: get().pendingEdges.filter(pe => pe.sourceNodeId !== nodeId),
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
    const { nodes } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    
    if (selectedNodes.length === 0) return;
    
    // Deep copy the selected nodes
    const copiedNodes = JSON.parse(JSON.stringify(selectedNodes));
    
    set({ clipboard: copiedNodes });
  },

  // Paste nodes from clipboard
  pasteNodes: () => {
    const { clipboard, nodes, edges } = get();
    
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

  // Favorites operations
  toggleFavorite: (nodeName) => {
    const favorites = new Set(get().favorites);
    if (favorites.has(nodeName)) {
      favorites.delete(nodeName);
    } else {
      favorites.add(nodeName);
    }

    saveFavoritesToStorage(favorites);
    set({ favorites });
  },

  isFavorite: (nodeName) => {
    return get().favorites.has(nodeName);
  },

  getFavoriteNodes: () => {
    const { nodeTypes, favorites } = get();
    return nodeTypes.filter(node => favorites.has(node.name));
  },

  // Add node from pending edge
  addNodeFromPendingEdge: (pendingEdgeId, nodeType) => {
    const pendingEdge = get().pendingEdges.find(pe => pe.id === pendingEdgeId);
    if (!pendingEdge) return;

    const nodeMetadata = get().nodeTypes.find(nt => nt.name === nodeType);
    if (!nodeMetadata) return;

    // Create new node at the pending edge target position
    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: pendingEdge.position,
      data: {
        type: nodeMetadata.name,
        name: nodeMetadata.displayName,
        parameters: {},
        metadata: nodeMetadata
      }
    };

    // Find the source node's first input handle (or default)
    const targetHandle = nodeMetadata.inputs && nodeMetadata.inputs.length > 0
      ? nodeMetadata.inputs[0].name || 'default'
      : 'default';

    // Create regular edge from source to new node
    const newEdge: Edge = {
      id: uuidv4(),
      source: pendingEdge.sourceNodeId,
      target: newNode.id,
      sourceHandle: pendingEdge.sourceHandle,
      targetHandle: targetHandle
    };

    // Create pending edges for the new node's outputs
    const newPendingEdges: PendingEdge[] = [];
    if (nodeMetadata.outputs && nodeMetadata.outputs.length > 0) {
      nodeMetadata.outputs.forEach((output, index) => {
        const newPendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: {
            x: pendingEdge.position.x + 300,
            y: pendingEdge.position.y + (index * 60)
          }
        };
        newPendingEdges.push(newPendingEdge);
      });
    } else {
      // Create default pending edge if no outputs metadata
      const newPendingEdge: PendingEdge = {
        id: uuidv4(),
        sourceNodeId: newNode.id,
        sourceHandle: 'default',
        position: {
          x: pendingEdge.position.x + 300,
          y: pendingEdge.position.y
        }
      };
      newPendingEdges.push(newPendingEdge);
    }

    // Remove the clicked pending edge and add new ones
    const updatedPendingEdges = get().pendingEdges.filter(pe => pe.id !== pendingEdgeId);

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
      pendingEdges: [...updatedPendingEdges, ...newPendingEdges]
    });
  },

  // Remove a pending edge
  removePendingEdge: (pendingEdgeId) => {
    set({
      pendingEdges: get().pendingEdges.filter(pe => pe.id !== pendingEdgeId)
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
    pendingEdges: [],
    selectedNode: null,
    clipboard: [],
    history: [],
    historyIndex: -1,
    favorites: loadFavoritesFromStorage(), // Keep favorites on reset
  })
}));
