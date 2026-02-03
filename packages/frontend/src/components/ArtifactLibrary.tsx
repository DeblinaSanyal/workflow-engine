import { useState } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/overflow.js';
import '@ui5/webcomponents-icons/dist/favorite.js';
import '@ui5/webcomponents-icons/dist/unfavorite.js';

export const ArtifactLibrary: React.FC = () => {
  const { nodeTypes, toggleFavorite, isFavorite, getFavoriteNodes } = useWorkflowStore();
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    trigger: true,
    action: true,
    transform: true,
    control: true,
    integration: true
  });

  const favoriteNodes = getFavoriteNodes();

  // Group nodes by category
  const nodesByCategory = nodeTypes.reduce((acc, node) => {
    const category = node.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  // Category metadata
  const categoryInfo: Record<string, { displayName: string; icon: string; color: string }> = {
    trigger: { displayName: 'Triggers', icon: '⚡', color: 'text-blue-600' },
    action: { displayName: 'Actions', icon: '⚙️', color: 'text-purple-600' },
    transform: { displayName: 'Transform', icon: '🔄', color: 'text-green-600' },
    control: { displayName: 'Control', icon: '🔀', color: 'text-orange-600' },
    integration: { displayName: 'Integrations', icon: '🔌', color: 'text-pink-600' },
    other: { displayName: 'Other', icon: '📦', color: 'text-gray-600' }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleToggleFavorite = (nodeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(nodeName);
  };

  const handleMenuClick = (nodeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === nodeName ? null : nodeName);
  };

  const handleMenuAction = (action: string, nodeName: string) => {
    setMenuOpen(null);
    
    if (action === 'favorite') {
      toggleFavorite(nodeName);
    } else if (action === 'info') {
      const node = nodeTypes.find(n => n.name === nodeName);
      if (node) {
        alert(`Node: ${node.displayName}\nType: ${node.name}\nCategory: ${node.category || 'other'}\nDescription: ${node.description || 'No description available'}`);
      }
    }
  };

  const renderNodeItem = (nodeType: any) => (
    <div
      key={nodeType.name}
      draggable
      onDragStart={(e) => onDragStart(e, nodeType.name)}
      className="relative flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-move transition-colors group"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
        {nodeType.icon || '⚙️'}
      </div>

      {/* Name */}
      <span className="flex-1 text-sm font-medium text-gray-800">{nodeType.displayName}</span>

      {/* Favorite star */}
      <button
        onClick={(e) => handleToggleFavorite(nodeType.name, e)}
        className="p-1 text-gray-400 hover:text-yellow-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title={isFavorite(nodeType.name) ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Icon name={isFavorite(nodeType.name) ? 'favorite' : 'unfavorite'} />
      </button>

      {/* Three-dot menu */}
      <div className="relative">
        <button
          onClick={(e) => handleMenuClick(nodeType.name, e)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="More options"
        >
          <Icon name="overflow" />
        </button>

        {/* Dropdown menu */}
        {menuOpen === nodeType.name && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(null)}
            />

            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => handleMenuAction('favorite', nodeType.name)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Icon name={isFavorite(nodeType.name) ? 'favorite' : 'unfavorite'} className="text-yellow-500" />
                {isFavorite(nodeType.name) ? 'Remove from favorites' : 'Add to favorites'}
              </button>
              <button
                onClick={() => handleMenuAction('info', nodeType.name)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 7.5V11.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="5" r="0.75" fill="currentColor" />
                </svg>
                View details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Artifact Library</h2>
      </div>

      {/* Artifact List */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites Section */}
        {favoriteNodes.length > 0 && (
          <div className="border-b-2 border-gray-200">
            <button
              onClick={() => setFavoritesExpanded(!favoritesExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Icon name="favorite" className="text-yellow-500" />
                <span>Favorites</span>
                <span className="text-gray-400">({favoriteNodes.length})</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${favoritesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {favoritesExpanded && (
              <div>
                {favoriteNodes.map((nodeType) => renderNodeItem(nodeType))}
              </div>
            )}
          </div>
        )}

        {/* Nodes by Category */}
        {Object.entries(nodesByCategory).sort(([a], [b]) => {
          const order = ['trigger', 'action', 'transform', 'control', 'integration', 'other'];
          return order.indexOf(a) - order.indexOf(b);
        }).map(([category, nodes]) => {
          const info = categoryInfo[category] || categoryInfo.other;
          const isExpanded = expandedCategories[category] !== false;

          return (
            <div key={category} className="border-b border-gray-200">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${info.color}`}>{info.icon}</span>
                  <span>{info.displayName}</span>
                  <span className="text-gray-400 font-normal">({nodes.length})</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="bg-white">
                  {nodes.map((nodeType) => renderNodeItem(nodeType))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
