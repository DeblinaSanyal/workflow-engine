import React, { useCallback, useRef, DragEvent, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Edge,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../stores/workflowStore';
import { CustomNode } from './CustomNode';
import { StartNode } from './StartNode';
import { LeftSidebar } from './LeftSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { WorkflowToolbar } from './WorkflowToolbar';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ResizablePanel from './ResizablePanel';
import { PlusButtonEdge } from './PlusButtonEdge';
import { RegularPlusButtonEdge } from './RegularPlusButtonEdge';
import { AddNodeMenu } from './AddNodeMenu';


const nodeTypes = {
  custom: CustomNode,
  start: StartNode
};

const edgeTypes = {
  pending: PlusButtonEdge,
  default: RegularPlusButtonEdge
};

const WorkflowEditorContent: React.FC = () => {
  const {
    nodes,
    edges,
    pendingEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    nodeTypes: availableNodeTypes,
    addNodeFromPendingEdge,
    insertNodeOnEdge
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [addNodeMenuState, setAddNodeMenuState] = useState<{
    isOpen: boolean;
    edgeId: string;
    position: { x: number; y: number };
    isRegularEdge: boolean;
  } | null>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
  });

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check if it's a workflow being dragged (check this first!)
      const workflowData = event.dataTransfer.getData('application/workflow');
      if (workflowData) {
        try {
          const workflow = JSON.parse(workflowData);
          useWorkflowStore.getState().addWorkflowAsSubworkflow(workflow, position);
          return;
        } catch (error) {
          console.error('Failed to parse workflow data:', error);
        }
      }

      // Check if it's a node type being dragged
      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (nodeType) {
        addNode(nodeType, position);
        return;
      }
    },
    [reactFlowInstance, addNode]
  );

  // Handle plus button click on pending edges
  const handlePendingEdgePlusClick = useCallback((edgeId: string, screenPosition: { x: number; y: number }) => {
    setAddNodeMenuState({
      isOpen: true,
      edgeId: edgeId,
      position: screenPosition,
      isRegularEdge: false
    });
  }, []);

  // Handle plus button click on regular edges
  const handleRegularEdgePlusClick = useCallback((edgeId: string, screenPosition: { x: number; y: number }) => {
    setAddNodeMenuState({
      isOpen: true,
      edgeId: edgeId,
      position: screenPosition,
      isRegularEdge: true
    });
  }, []);

  // Create ghost nodes and pending edges for React Flow
  const { allNodes, allEdges } = useMemo(() => {
    // Create invisible ghost nodes for each pending edge target
    const ghostNodes = pendingEdges.map(pe => ({
      id: 'ghost-' + pe.id,
      type: 'custom',
      position: pe.position,
      data: {
        type: 'ghost',
        name: '',
        parameters: {},
        metadata: {
          name: 'ghost',
          displayName: '',
          description: '',
          category: 'action',
          icon: '',
          version: '1.0.0',
          parameters: [],
          inputs: [],
          outputs: []
        },
        isGhost: true
      },
      style: {
        opacity: 0,
        pointerEvents: 'none' as const,
        width: 1,
        height: 1,
      },
      draggable: false,
      selectable: false,
    }));

    // Create pending edges
    const pendingEdgesAsReactFlow: Edge[] = pendingEdges.map(pe => ({
      id: pe.id,
      source: pe.sourceNodeId,
      target: 'ghost-' + pe.id,
      sourceHandle: pe.sourceHandle,
      targetHandle: 'default', // Add default target handle for ghost nodes
      type: 'pending',
      data: {
        onPlusClick: handlePendingEdgePlusClick
      },
      selectable: false,
      deletable: true,
    }));

    // Add plus button data to regular edges
    const regularEdgesWithPlusButton: Edge[] = edges.map(edge => ({
      ...edge,
      type: edge.type || 'default',
      data: {
        ...edge.data,
        onPlusClick: handleRegularEdgePlusClick
      }
    }));

    return {
      allNodes: [...nodes, ...ghostNodes],
      allEdges: [...regularEdgesWithPlusButton, ...pendingEdgesAsReactFlow]
    };
  }, [nodes, edges, pendingEdges, handlePendingEdgePlusClick, handleRegularEdgePlusClick]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar (Node Library + Workflows) */}
      <ResizablePanel
        side="left"
        minWidth={240}
        maxWidth={600}
        defaultWidth={320}
        storageKey="workflow-panel-left-width"
      >
        <LeftSidebar />
      </ResizablePanel>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <WorkflowToolbar />

        {/* React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={allNodes}
            edges={allEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"

          >
            <Background />
            <Controls />
            <MiniMap />



          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      <ResizablePanel
        side="right"
        minWidth={240}
        maxWidth={600}
        defaultWidth={320}
        storageKey="workflow-panel-right-width"
      >
        <PropertiesPanel />
      </ResizablePanel>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Add Node Menu */}
      {addNodeMenuState && (
        <AddNodeMenu
          position={addNodeMenuState.position}
          onClose={() => setAddNodeMenuState(null)}
          onSelectNode={(nodeType) => {
            if (addNodeMenuState.isRegularEdge) {
              // Convert screen position to flow position for regular edges
              if (reactFlowInstance) {
                const flowPosition = reactFlowInstance.screenToFlowPosition({
                  x: addNodeMenuState.position.x,
                  y: addNodeMenuState.position.y
                });
                insertNodeOnEdge(addNodeMenuState.edgeId, nodeType, flowPosition);
              }
            } else {
              addNodeFromPendingEdge(addNodeMenuState.edgeId, nodeType);
            }
            setAddNodeMenuState(null);
          }}
          availableNodes={availableNodeTypes.map(nt => ({
            type: nt.name,
            label: nt.displayName,
            category: nt.category,
            description: nt.description
          }))}
        />
      )}

    </div>
  );
};

export const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};
