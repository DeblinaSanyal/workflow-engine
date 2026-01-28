import React, { useState, useMemo, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';
import { NodeMetadata } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { nodeTypes, addNode } = useWorkflowStore();
  const reactFlowInstance = useReactFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fuzzy search implementation
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodeTypes;

    const searchLower = searchTerm.toLowerCase();
    return nodeTypes
      .filter(
        (node) =>
          node.displayName.toLowerCase().includes(searchLower) ||
          node.description.toLowerCase().includes(searchLower) ||
          node.category.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        // Prioritize matches in displayName
        const aNameMatch = a.displayName.toLowerCase().startsWith(searchLower);
        const bNameMatch = b.displayName.toLowerCase().startsWith(searchLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return 0;
      });
  }, [nodeTypes, searchTerm]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNodes[selectedIndex]) {
        handleSelectNode(filteredNodes[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectNode = (nodeType: NodeMetadata) => {
    // Add node to center of current viewport
    const position = reactFlowInstance.project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    addNode(nodeType.name, position);
    onClose();
    setSearchTerm('');
    setSelectedIndex(0);
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Clamp selected index when filtered list changes
  useEffect(() => {
    if (selectedIndex >= filteredNodes.length && filteredNodes.length > 0) {
      setSelectedIndex(filteredNodes.length - 1);
    }
  }, [filteredNodes.length, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[500px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search nodes... (type to filter)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-4 py-3 text-lg border-none outline-none"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No nodes found
            </div>
          ) : (
            filteredNodes.map((node, index) => (
              <button
                key={node.name}
                onClick={() => handleSelectNode(node)}
                className={`w-full p-3 rounded-lg flex items-start gap-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">{node.icon || '⚙️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{node.displayName}</div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {node.description}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full">
                      {node.category}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex justify-between">
          <span>↑↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};
