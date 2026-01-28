import React, { useCallback, useRef, DragEvent, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../stores/workflowStore';
import { CustomNode } from './CustomNode';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { WorkflowToolbar } from './WorkflowToolbar';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ResizablePanel from './ResizablePanel';
import { PlusButtonEdge } from './PlusButtonEdge';
import { AddNodeMenu } from './AddNodeMenu';

const nodeTypes = {
  custom: CustomNode
};

const edgeTypes = {
  pending: PlusButtonEdge
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
    addNodeFromPendingEdge
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [addNodeMenuState, setAddNodeMenuState] = useState<{
    isOpen: boolean;
    pendingEdgeId: string;
    position: { x: number; y: number };
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

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  // Handle plus button click on pending edges
  const handlePlusClick = useCallback((edgeId: string, screenPosition: { x: number; y: number }) => {
    setAddNodeMenuState({
      isOpen: true,
      pendingEdgeId: edgeId,
      position: screenPosition
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
      type: 'pending',
      data: {
        onPlusClick: handlePlusClick
      },
      selectable: false,
      deletable: true,
    }));

    console.log('[WorkflowEditor] Rendering with pending edges:', {
      pendingEdgesCount: pendingEdges.length,
      pendingEdges: pendingEdges,
      ghostNodesCount: ghostNodes.length,
      pendingEdgesAsReactFlow: pendingEdgesAsReactFlow
    });

    return {
      allNodes: [...nodes, ...ghostNodes],
      allEdges: [...edges, ...pendingEdgesAsReactFlow]
    };
  }, [nodes, edges, pendingEdges, handlePlusClick]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Node Palette */}
      <ResizablePanel
        side="left"
        minWidth={240}
        maxWidth={600}
        defaultWidth={320}
        storageKey="workflow-panel-left-width"
      >
        <NodePalette />
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
            onInit={setReactFlowInstance}
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

            <Panel position="top-center" className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">
                Drag nodes from the left panel onto the canvas
              </p>
            </Panel>
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
            addNodeFromPendingEdge(addNodeMenuState.pendingEdgeId, nodeType);
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
