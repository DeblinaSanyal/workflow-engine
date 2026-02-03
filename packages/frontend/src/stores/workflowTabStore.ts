import { create } from 'zustand';
import { Workflow } from '../services/api';

export interface WorkflowTab {
  id: string; // Unique tab ID
  workflowId?: string; // Actual workflow ID from backend (undefined for new workflows)
  name: string;
  isDirty: boolean; // Has unsaved changes
  isActive: boolean;
  isMain: boolean; // First tab opened - the main workflow
}

interface WorkflowTabStore {
  tabs: WorkflowTab[];
  activeTabId: string | null;

  // Tab management
  addTab: (workflow?: Partial<Workflow>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabName: (tabId: string, name: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  updateTabWorkflowId: (tabId: string, workflowId: string) => void;
  
  // Utilities
  getActiveTab: () => WorkflowTab | null;
  hasUnsavedChanges: () => boolean;
}

let tabCounter = 0;

export const useWorkflowTabStore = create<WorkflowTabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (workflow) => {
    const newTabId = `tab-${Date.now()}-${tabCounter++}`;
    const isFirstTab = get().tabs.length === 0;
    
    const newTab: WorkflowTab = {
      id: newTabId,
      workflowId: workflow?.id,
      name: workflow?.name || 'New Workflow',
      isDirty: false,
      isActive: true,
      isMain: isFirstTab // First tab is the main workflow
    };

    // Deactivate all other tabs
    const updatedTabs = get().tabs.map(tab => ({ ...tab, isActive: false }));

    set({
      tabs: [...updatedTabs, newTab],
      activeTabId: newTabId
    });
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    
    // If closing active tab, activate another tab
    let newActiveTabId = activeTabId;
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Activate the tab to the left, or the first tab if closing the leftmost
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        newActiveTabId = newTabs[newActiveIndex]?.id || null;
        if (newActiveTabId) {
          newTabs[newActiveIndex].isActive = true;
        }
      } else {
        newActiveTabId = null;
      }
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveTabId
    });
  },

  setActiveTab: (tabId) => {
    const updatedTabs = get().tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));

    set({
      tabs: updatedTabs,
      activeTabId: tabId
    });
  },

  updateTabName: (tabId, name) => {
    const updatedTabs = get().tabs.map(tab =>
      tab.id === tabId ? { ...tab, name } : tab
    );
    set({ tabs: updatedTabs });
  },

  markTabDirty: (tabId, isDirty) => {
    const updatedTabs = get().tabs.map(tab =>
      tab.id === tabId ? { ...tab, isDirty } : tab
    );
    set({ tabs: updatedTabs });
  },

  updateTabWorkflowId: (tabId, workflowId) => {
    const updatedTabs = get().tabs.map(tab =>
      tab.id === tabId ? { ...tab, workflowId } : tab
    );
    set({ tabs: updatedTabs });
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find(t => t.id === activeTabId) || null;
  },

  hasUnsavedChanges: () => {
    return get().tabs.some(tab => tab.isDirty);
  }
}));
