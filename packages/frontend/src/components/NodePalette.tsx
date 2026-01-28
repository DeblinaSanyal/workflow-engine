import React, { useState } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { Search, ChevronDown, ChevronRight, Star } from 'lucide-react';

export const NodePalette: React.FC = () => {
  const { nodeTypes, toggleFavorite, isFavorite, getFavoriteNodes } = useWorkflowStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['favorites', 'action', 'transform', 'control', 'integration'])
  );

  const filteredNodes = nodeTypes.filter(node =>
    node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { key: 'favorites', label: 'Favorites', icon: '⭐' },
    { key: 'trigger', label: 'Triggers', icon: '⚡' },
    { key: 'action', label: 'Actions', icon: '⚙️' },
    { key: 'transform', label: 'Transform', icon: '🔄' },
    { key: 'control', label: 'Control Flow', icon: '🔀' },
    { key: 'integration', label: 'Integrations', icon: '🔌' }
  ];

  const getCategoryNodes = (category: string) => {
    if (category === 'favorites') {
      const favoriteNodes = getFavoriteNodes();
      return favoriteNodes.filter(node =>
        node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredNodes.filter(node => node.category === category);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'favorites': return 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
      case 'trigger': return 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
      case 'action': return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
      case 'transform': return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
      case 'control': return 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100';
      case 'integration': return 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100';
      default: return 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100';
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col h-full shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <span>Node Library</span>
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Node Count Badge */}
        <div className="mt-3 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full inline-block">
          {filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {categories.map(category => {
          const nodes = getCategoryNodes(category.key);
          if (nodes.length === 0 && searchTerm) return null;
          
          const isExpanded = expandedCategories.has(category.key);

          return (
            <div key={category.key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                    {category.label}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                    {nodes.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {/* Category Nodes */}
              {isExpanded && (
                <div className="p-2 space-y-2 bg-gray-50">
                  {nodes.length === 0 ? (
                    category.key === 'favorites' ? (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        <Star size={32} className="mx-auto mb-2 text-gray-300" />
                        <p>No favorites yet</p>
                        <p className="text-xs mt-1">Click the star icon on any node to add it</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No nodes in this category
                      </div>
                    )
                  ) : (
                    nodes.map(node => (
                      <div
                        key={node.name}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.name)}
                        className={`p-3 rounded-lg border cursor-move transition-all transform hover:scale-[1.02] hover:shadow-md ${getCategoryColor(category.key)}`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-2xl">{node.icon || '⚙️'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold text-sm truncate">{node.displayName}</div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(node.name);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-white/60 rounded transition-colors"
                                title={isFavorite(node.name) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Star
                                  size={14}
                                  className={isFavorite(node.name) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
                                />
                              </button>
                            </div>
                            <p className="text-xs opacity-75 mt-0.5 line-clamp-2">{node.description}</p>
                          </div>
                        </div>
                        
                        {/* Node metadata badges */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          <span className="text-[10px] bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                            v{node.version}
                          </span>
                          <span className="text-[10px] bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                            {node.parameters.length} params
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredNodes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">No nodes found</h3>
            <p className="text-gray-600 text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Drag nodes onto the canvas to build your workflow
        </div>
      </div>
    </div>
  );
};
