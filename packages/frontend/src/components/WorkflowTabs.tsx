import React from 'react';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/add.js';

interface WorkflowTabsProps {}

export const WorkflowTabs: React.FC<WorkflowTabsProps> = () => {
  const { tabs, setActiveTab, closeTab } = useWorkflowTabStore();
  const { reset } = useWorkflowStore();

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.isDirty) {
      const confirmed = window.confirm(
        `"${tab.name}" has unsaved changes. Are you sure you want to close it?`
      );
      if (!confirmed) return;
    }
    
    closeTab(tabId);
    
    // If we closed the active tab, the store should switch to another tab
    // Reset workflow if no tabs remain
    if (tabs.length === 1) {
      reset();
    }
  };

  console.log('[WorkflowTabs] tabs.length =', tabs.length);
  console.log('[WorkflowTabs] tabs =', tabs);

  if (tabs.length === 0) {
    console.log('[WorkflowTabs] No tabs - returning null');
    return null;
  }

  console.log('[WorkflowTabs] Rendering tabs...');

  return (
    <div className="flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto" style={{ minHeight: '50px' }}>
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map(tab => {
          const tabStyle = {
            backgroundColor: tab.isActive ? 'white' : '#f9fafb',
            color: tab.isActive ? '#9333ea' : '#374151',
            borderBottom: tab.isActive ? '2px solid #9333ea' : 'none'
          };

          return (
            <div
              key={tab.id}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium border-r border-gray-200 transition-colors min-w-[150px] max-w-[250px] cursor-pointer hover:bg-gray-100"
              style={tabStyle}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="truncate flex-1 text-left flex items-center gap-1.5">
                {tab.name}
                {tab.isDirty && <span className="text-orange-500 font-bold">•</span>}
                {tab.isMain && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-semibold">
                    Main
                  </span>
                )}
              </span>

              {(!tab.isMain || tabs.length === 1) && (
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className="p-0.5 rounded hover:bg-gray-200 transition-colors text-xs opacity-0 group-hover:opacity-70 hover:opacity-100"
                  title="Close tab"
                >
                  <Icon name="decline" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
