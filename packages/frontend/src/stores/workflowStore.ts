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

// Helper function to check if two nodes overlap
const nodesOverlap = (pos1: { x: number; y: number }, pos2: { x: number; y: number }, nodeWidth = 220, nodeHeight = 120, padding = 40): boolean => {
  const xOverlap = Math.abs(pos1.x - pos2.x) < (nodeWidth + padding);
  const yOverlap = Math.abs(pos1.y - pos2.y) < (nodeHeight + padding);
  return xOverlap && yOverlap;
};

// Helper function to find non-overlapping position
const findNonOverlappingPosition = (desiredPosition: { x: number; y: number }, existingNodes: Node[]): { x: number; y: number } => {
  let position = { ...desiredPosition };
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const hasOverlap = existingNodes.some(node => 
      nodesOverlap(position, node.position)
    );
    
    if (!hasOverlap) {
      return position;
    }
    
    // Try different positions in a spiral pattern
    const angle = (attempts * 0.5) * Math.PI;
    const distance = 100 + (attempts * 30);
    position = {
      x: desiredPosition.x + Math.cos(angle) * distance,
      y: desiredPosition.y + Math.sin(angle) * distance
    };
    
    attempts++;
  }
  
  // If we couldn't find a spot, just offset to the right and down
  return {
    x: desiredPosition.x + (existingNodes.length * 50),
    y: desiredPosition.y + (existingNodes.length * 50)
  };
};

interface WorkflowStore {
  // Workflow metadata
  workflowId?: string;
  workflowName: string;
  workflowDescription?: string;
  workflowStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ERROR';

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
  duplicateNode: (nodeId: string) => void;
  
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

  // Insert node on regular edge
  insertNodeOnEdge: (edgeId: string, nodeType: string, position: { x: number; y: number }) => void;

  // Add workflow as subworkflow
  addWorkflowAsSubworkflow: (workflow: Workflow, position: { x: number; y: number }) => void;

  // Convert to API format
  toWorkflowData: () => Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;

  // Reset
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowName: 'Untitled Workflow',
  workflowStatus: 'DRAFT',
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

    // Find non-overlapping position
    const adjustedPosition = findNonOverlappingPosition(position, get().nodes);

    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: adjustedPosition,
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
      nodeType.outputs.forEach((output, index) => {
        const desiredPosition = {
          x: adjustedPosition.x + 300,
          y: adjustedPosition.y + (index * 60) // Offset each pending edge vertically
        };
        const pendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: desiredPosition
        };
        newPendingEdges.push(pendingEdge);
      });
    } else {
      // If no outputs metadata, create a single default pending edge
      const desiredPosition = {
        x: adjustedPosition.x + 300,
        y: adjustedPosition.y
      };
      const pendingEdge: PendingEdge = {
        id: uuidv4(),
        sourceNodeId: newNode.id,
        sourceHandle: 'default',
        position: desiredPosition
      };
      newPendingEdges.push(pendingEdge);
    }

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
    const { edges, nodes, pendingEdges, selectedNode } = get();
    
    // Find all edges connected to the node being deleted
    const incomingEdges = edges.filter(e => e.target === nodeId);
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    
    // Remove edges connected to this node
    let updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    // Auto-reconnect: If node has both incoming and outgoing edges, connect them
    if (incomingEdges.length > 0 && outgoingEdges.length > 0) {
      // For each incoming edge, connect it to the first outgoing edge's target
      // This handles the simple case of a node in the middle of a chain
      incomingEdges.forEach(inEdge => {
        outgoingEdges.forEach(outEdge => {
          const reconnectedEdge: Edge = {
            id: uuidv4(),
            source: inEdge.source,
            sourceHandle: inEdge.sourceHandle,
            target: outEdge.target,
            targetHandle: outEdge.targetHandle,
            type: 'default'
          };
          updatedEdges.push(reconnectedEdge);
        });
      });
    }
    
    set({
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: updatedEdges,
      pendingEdges: pendingEdges.filter(pe => pe.sourceNodeId !== nodeId),
      selectedNode: selectedNode?.id === nodeId ? null : selectedNode
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
    
    // Create new nodes with new IDs and adjusted positions to avoid overlap
    const idMapping: Record<string, string> = {};
    const offset = { x: 50, y: 50 };
    const allExistingNodes = [...nodes];
    
    const newNodes: Node[] = clipboard.map((node) => {
      const newId = uuidv4();
      idMapping[node.id] = newId;
      
      const desiredPosition = {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      };
      
      // Find non-overlapping position for each pasted node
      const adjustedPosition = findNonOverlappingPosition(desiredPosition, allExistingNodes);
      
      const newNode = {
        ...node,
        id: newId,
        position: adjustedPosition,
        selected: true, // Select the pasted nodes
      };
      
      // Add to existing nodes list for next iteration
      allExistingNodes.push(newNode);
      
      return newNode;
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
    
    // Create new nodes with new IDs and adjusted positions to avoid overlap
    const idMapping: Record<string, string> = {};
    const offset = { x: 50, y: 50 };
    const allExistingNodes = [...nodes];
    
    const newNodes: Node[] = selectedNodes.map((node) => {
      const newId = uuidv4();
      idMapping[node.id] = newId;
      
      const desiredPosition = {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      };
      
      // Find non-overlapping position for each duplicated node
      const adjustedPosition = findNonOverlappingPosition(desiredPosition, allExistingNodes);
      
      const newNode = {
        ...JSON.parse(JSON.stringify(node)),
        id: newId,
        position: adjustedPosition,
        selected: true,
      };
      
      // Add to existing nodes list for next iteration
      allExistingNodes.push(newNode);
      
      return newNode;
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

  // Duplicate a single node by ID
  duplicateNode: (nodeId) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    
    if (!nodeToDuplicate) return;
    
    // Save current state before duplicating
    get().saveToHistory();
    
    const offset = { x: 50, y: 50 };
    const desiredPosition = {
      x: nodeToDuplicate.position.x + offset.x,
      y: nodeToDuplicate.position.y + offset.y,
    };
    
    // Find non-overlapping position
    const adjustedPosition = findNonOverlappingPosition(desiredPosition, nodes);
    
    const newNode: Node = {
      ...JSON.parse(JSON.stringify(nodeToDuplicate)),
      id: uuidv4(),
      position: adjustedPosition,
      selected: true,
    };
    
    // Deselect all existing nodes
    const updatedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));
    
    // Create pending edges for the new node if it has outputs
    const newPendingEdges: PendingEdge[] = [];
    const nodeMetadata = nodeToDuplicate.data?.metadata;
    
    if (nodeMetadata?.outputs && nodeMetadata.outputs.length > 0) {
      nodeMetadata.outputs.forEach((output: any, index: number) => {
        const desiredPendingPosition = {
          x: adjustedPosition.x + 300,
          y: adjustedPosition.y + (index * 60)
        };
        const newPendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: desiredPendingPosition
        };
        newPendingEdges.push(newPendingEdge);
      });
    } else {
      const desiredPendingPosition = {
        x: adjustedPosition.x + 300,
        y: adjustedPosition.y
      };
      const newPendingEdge: PendingEdge = {
        id: uuidv4(),
        sourceNodeId: newNode.id,
        sourceHandle: 'default',
        position: desiredPendingPosition
      };
      newPendingEdges.push(newPendingEdge);
    }
    
    set({
      nodes: [...updatedNodes, newNode],
      pendingEdges: [...get().pendingEdges, ...newPendingEdges]
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

    // Find non-overlapping position near the pending edge target
    const adjustedPosition = findNonOverlappingPosition(pendingEdge.position, get().nodes);

    // Create new node at the adjusted position
    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: adjustedPosition,
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
        const desiredPendingPosition = {
          x: adjustedPosition.x + 300,
          y: adjustedPosition.y + (index * 60)
        };
        const newPendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: desiredPendingPosition
        };
        newPendingEdges.push(newPendingEdge);
      });
    } else {
      // Create default pending edge if no outputs metadata
      const desiredPendingPosition = {
        x: adjustedPosition.x + 300,
        y: adjustedPosition.y
      };
      const newPendingEdge: PendingEdge = {
        id: uuidv4(),
        sourceNodeId: newNode.id,
        sourceHandle: 'default',
        position: desiredPendingPosition
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

  // Insert node on regular edge
  insertNodeOnEdge: (edgeId, nodeType, position) => {
    const edge = get().edges.find(e => e.id === edgeId);
    if (!edge) return;

    const nodeMetadata = get().nodeTypes.find(nt => nt.name === nodeType);
    if (!nodeMetadata) return;

    // Find non-overlapping position
    const adjustedPosition = findNonOverlappingPosition(position, get().nodes);

    // Create new node at the adjusted position
    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: adjustedPosition,
      data: {
        type: nodeMetadata.name,
        name: nodeMetadata.displayName,
        parameters: {},
        metadata: nodeMetadata
      }
    };

    // Get the input and output handles for the new node
    const newNodeInputHandle = nodeMetadata.inputs && nodeMetadata.inputs.length > 0
      ? nodeMetadata.inputs[0].name || 'default'
      : 'default';
    
    const newNodeOutputHandle = nodeMetadata.outputs && nodeMetadata.outputs.length > 0
      ? nodeMetadata.outputs[0].name || 'default'
      : 'default';

    // Create edge from source to new node
    const edgeToNewNode: Edge = {
      id: uuidv4(),
      source: edge.source,
      target: newNode.id,
      sourceHandle: edge.sourceHandle,
      targetHandle: newNodeInputHandle
    };

    // Create edge from new node to original target
    const edgeFromNewNode: Edge = {
      id: uuidv4(),
      source: newNode.id,
      target: edge.target,
      sourceHandle: newNodeOutputHandle,
      targetHandle: edge.targetHandle
    };

    // Create pending edges for the new node's other outputs (if any)
    const newPendingEdges: PendingEdge[] = [];
    if (nodeMetadata.outputs && nodeMetadata.outputs.length > 1) {
      // Skip the first output since it's already connected
      nodeMetadata.outputs.slice(1).forEach((output, index) => {
        const desiredPendingPosition = {
          x: adjustedPosition.x + 300,
          y: adjustedPosition.y + ((index + 1) * 60)
        };
        const newPendingEdge: PendingEdge = {
          id: uuidv4(),
          sourceNodeId: newNode.id,
          sourceHandle: output.name || 'default',
          position: desiredPendingPosition
        };
        newPendingEdges.push(newPendingEdge);
      });
    }

    // Remove the old edge and add the new node and edges
    const updatedEdges = get().edges.filter(e => e.id !== edgeId);

    set({
      nodes: [...get().nodes, newNode],
      edges: [...updatedEdges, edgeToNewNode, edgeFromNewNode],
      pendingEdges: [...get().pendingEdges, ...newPendingEdges]
    });
  },

  // Add workflow as a subworkflow node
  addWorkflowAsSubworkflow: (workflow, position) => {
    // Find non-overlapping position
    const adjustedPosition = findNonOverlappingPosition(position, get().nodes);

    // Create a special node representing the subworkflow
    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: adjustedPosition,
      data: {
        type: 'subworkflow',
        name: workflow.name,
        parameters: {
          workflowId: workflow.id,
          workflowName: workflow.name,
          description: workflow.description
        },
        metadata: {
          name: 'subworkflow',
          displayName: workflow.name,
          description: workflow.description || 'Execute another workflow',
          icon: '📋',
          category: 'action',
          version: 1,
          parameters: [],
          inputs: [{ name: 'default', type: 'any' }],
          outputs: [{ name: 'default', type: 'any' }]
        }
      }
    };

    // Create pending edge for the subworkflow node
    const pendingEdge: PendingEdge = {
      id: uuidv4(),
      sourceNodeId: newNode.id,
      sourceHandle: 'default',
      position: {
        x: adjustedPosition.x + 300,
        y: adjustedPosition.y
      }
    };

    set({
      nodes: [...get().nodes, newNode],
      pendingEdges: [...get().pendingEdges, pendingEdge]
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
