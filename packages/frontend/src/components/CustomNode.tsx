import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { useWorkflowInstanceStore } from '../stores/workflowInstanceStore';
import { apiClient } from '../services/api';
import { NodeContextMenu } from './NodeContextMenu';

export const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { deleteNode, setSelectedNode, duplicateNode } = useWorkflowStore();
  const { addTab } = useWorkflowTabStore();
  const { createInstance } = useWorkflowInstanceStore();
  const metadata = data.metadata;
  const isSubworkflow = data.type === 'subworkflow';

  // Render ghost nodes with invisible handles only
  if (data.isGhost) {
    return (
      <div style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
        <Handle
          type="target"
          position={Position.Left}
          id="default"
          style={{ opacity: 0 }}
        />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trigger': return {
        bg: 'bg-gradient-to-br from-green-500 to-green-600',
        border: 'border-green-400',
        shadow: 'shadow-green-200'
      };
      case 'action': return {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        border: 'border-blue-400',
        shadow: 'shadow-blue-200'
      };
      case 'transform': return {
        bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        border: 'border-purple-400',
        shadow: 'shadow-purple-200'
      };
      case 'control': return {
        bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        border: 'border-yellow-400',
        shadow: 'shadow-yellow-200'
      };
      case 'integration': return {
        bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        border: 'border-indigo-400',
        shadow: 'shadow-indigo-200'
      };
      default: return {
        bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
        border: 'border-gray-400',
        shadow: 'shadow-gray-200'
      };
    }
  };

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleDuplicate = () => {
    duplicateNode(id);
  };

  const handleShowDetails = () => {
    setSelectedNode({ id, data, selected, type: 'custom', position: { x: 0, y: 0 } });
  };

  const handleClick = () => {
    setSelectedNode({ id, data, selected, type: 'custom', position: { x: 0, y: 0 } });
  };

  const handleDoubleClick = async () => {
    // If it's a subworkflow node, open the subworkflow in a new tab
    if (isSubworkflow && data.parameters?.workflowId) {
      try {
        const workflow = await apiClient.getWorkflow(data.parameters.workflowId);
        addTab(workflow); // Add tab with workflow data
        const tabs = useWorkflowTabStore.getState().tabs;
        const newTab = tabs[tabs.length - 1];
        if (newTab) {
          createInstance(newTab.id, workflow); // Create instance with workflow data
        }
      } catch (error) {
        console.error('Failed to load subworkflow:', error);
        alert('Failed to open subworkflow');
      }
    }
  };

  const colors = getCategoryColor(metadata?.category || 'action');

  return (
    <div 
      className={`bg-white rounded-lg shadow-md min-w-[220px] border-2 transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${isSubworkflow ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={isSubworkflow ? 'Double-click to open subworkflow in new tab' : ''}
    >
      {/* Header - SAP UI5 Style */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
            {metadata?.icon || '⚙️'}
          </div>
          <span className="font-semibold text-sm text-gray-800 truncate">{data.name}</span>
        </div>
        <div className="flex items-center">
          <NodeContextMenu
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onShowDetails={handleShowDetails}
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 bg-white">
        <div className="text-xs text-gray-600 line-clamp-2 mb-2">
          {metadata?.description || 'No description'}
        </div>
        
        {/* Metadata badges */}
        <div className="flex gap-1 flex-wrap">
          <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
            {metadata?.category || 'node'}
          </span>
          {metadata?.parameters && metadata.parameters.length > 0 && (
            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
              {metadata.parameters.length} params
            </span>
          )}
          {isSubworkflow && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
              Subworkflow
            </span>
          )}
        </div>
      </div>

      {/* Input Handles */}
      {metadata?.inputs?.map((input: any, index: number) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={input.name}
          style={{ 
            top: `${50 + index * 20}px`,
            background: '#6B7280',
            width: '14px',
            height: '14px',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          className="transition-all hover:scale-125"
        />
      )) || (
        <Handle
          type="target"
          position={Position.Left}
          id="default"
          style={{ 
            background: '#6B7280',
            width: '14px',
            height: '14px',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          className="transition-all hover:scale-125"
        />
      )}

      {/* Output Handles */}
      {metadata?.outputs?.map((output: any, index: number) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{ 
            top: `${50 + index * 20}px`,
            background: colors.bg.includes('blue') ? '#3B82F6' : 
                       colors.bg.includes('green') ? '#10B981' :
                       colors.bg.includes('purple') ? '#8B5CF6' :
                       colors.bg.includes('yellow') ? '#F59E0B' :
                       colors.bg.includes('indigo') ? '#6366F1' : '#6B7280',
            width: '14px',
            height: '14px',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          className="transition-all hover:scale-125"
        />
      )) || (
        <Handle
          type="source"
          position={Position.Right}
          id="default"
          style={{ 
            background: '#3B82F6',
            width: '14px',
            height: '14px',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          className="transition-all hover:scale-125"
        />
      )}
    </div>
  );
};
