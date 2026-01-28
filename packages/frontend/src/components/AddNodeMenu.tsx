import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Star } from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  category: string;
  description?: string;
}

interface AddNodeMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
  availableNodes: NodeType[];
}

const FAVORITES_STORAGE_KEY = 'workflow-favorites';

export const AddNodeMenu: React.FC<AddNodeMenuProps> = ({
  position,
  onClose,
  onSelectNode,
  availableNodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const toggleFavorite = (nodeType: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(nodeType)) {
      newFavorites.delete(nodeType);
    } else {
      newFavorites.add(nodeType);
    }
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...newFavorites]));
  };

  const filteredNodes = availableNodes.filter((node) => {
    const query = searchQuery.toLowerCase();
    return (
      node.label.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      node.category.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query)
    );
  });

  const favoriteNodes = filteredNodes.filter((node) => favorites.has(node.type));
  const otherNodes = filteredNodes.filter((node) => !favorites.has(node.type));
  const allFilteredNodes = [...favoriteNodes, ...otherNodes];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allFilteredNodes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allFilteredNodes[selectedIndex]) {
        e.preventDefault();
        onSelectNode(allFilteredNodes[selectedIndex].type);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allFilteredNodes, selectedIndex, onClose, onSelectNode]);

  useEffect(() => {
    const selectedElement = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, 10px)',
        zIndex: 1000,
      }}
      className="nodrag nopan"
    >
      <div
        ref={menuRef}
        className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-hidden flex flex-col animate-slide-in"
      >
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Add Node</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-1.5 text-xs text-gray-500 flex items-center justify-between">
            <span>Use arrow keys to navigate</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-gray-300">Enter</span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {favoriteNodes.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                Favorites
              </div>
              {favoriteNodes.map((node, index) => (
                <NodeMenuItem
                  key={node.type}
                  node={node}
                  index={index}
                  isSelected={selectedIndex === index}
                  isFavorite={true}
                  onSelect={() => onSelectNode(node.type)}
                  onToggleFavorite={() => toggleFavorite(node.type)}
                />
              ))}
            </div>
          )}

          {otherNodes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-600">
                All Nodes
              </div>
              {otherNodes.map((node, index) => {
                const adjustedIndex = index + favoriteNodes.length;
                return (
                  <NodeMenuItem
                    key={node.type}
                    node={node}
                    index={adjustedIndex}
                    isSelected={selectedIndex === adjustedIndex}
                    isFavorite={false}
                    onSelect={() => onSelectNode(node.type)}
                    onToggleFavorite={() => toggleFavorite(node.type)}
                  />
                );
              })}
            </div>
          )}

          {allFilteredNodes.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No nodes found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NodeMenuItemProps {
  node: NodeType;
  index: number;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const NodeMenuItem: React.FC<NodeMenuItemProps> = ({
  node,
  index,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <div
      data-index={index}
      className={`px-3 py-2 cursor-pointer flex items-center justify-between group transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500'
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{node.label}</div>
        <div className="text-xs text-gray-500 truncate">{node.category}</div>
        {node.description && (
          <div className="text-xs text-gray-400 truncate mt-0.5">{node.description}</div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`ml-2 p-1 rounded hover:bg-white transition-colors ${
          isFavorite ? 'text-yellow-500' : 'text-gray-300 group-hover:text-gray-400'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={16} className={isFavorite ? 'fill-yellow-500' : ''} />
      </button>
    </div>
  );
};
