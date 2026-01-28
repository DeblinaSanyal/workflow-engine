import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Settings } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflowStore';

export const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { deleteNode, setSelectedNode } = useWorkflowStore();
  const metadata = data.metadata;

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const handleClick = () => {
    setSelectedNode({ id, data, selected, type: 'custom', position: { x: 0, y: 0 } });
  };

  const colors = getCategoryColor(metadata?.category || 'action');

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg min-w-[220px] transition-all transform hover:scale-105 ${
        selected ? `ring-4 ring-blue-400 ${colors.shadow} shadow-xl` : 'shadow-md'
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className={`${colors.bg} text-white px-4 py-3 rounded-t-xl flex justify-between items-center ${colors.border} border-b-2`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl drop-shadow-md">{metadata?.icon || '⚙️'}</span>
          <span className="font-bold text-sm truncate">{data.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClick}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            title="Configure"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 bg-gradient-to-b from-white to-gray-50">
        <div className="text-xs text-gray-600 line-clamp-2 mb-2">
          {metadata?.description || 'No description'}
        </div>
        
        {/* Metadata badges */}
        <div className="flex gap-1 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.bg.replace('from-', 'bg-').replace('to-', '').split(' ')[0]} bg-opacity-10 text-gray-700 border ${colors.border}`}>
            {metadata?.category || 'node'}
          </span>
          {metadata?.parameters && metadata.parameters.length > 0 && (
            <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium border border-gray-300">
              {metadata.parameters.length} params
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
