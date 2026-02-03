import React, { useEffect } from 'react';
import { WorkflowTabs } from './WorkflowTabs';
import { WorkflowEditor } from './WorkflowEditor';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { useWorkflowInstanceStore } from '../stores/workflowInstanceStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { apiClient } from '../services/api';

export const TabbedWorkflowEditor: React.FC = () => {
  const { tabs, activeTabId, addTab, updateTabName, markTabDirty } = useWorkflowTabStore();
  const { createInstance, getInstance, updateInstance } = useWorkflowInstanceStore();
  const workflowStore = useWorkflowStore();
  const [loading, setLoading] = React.useState(true);

  // Load node types on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const nodeTypes = await apiClient.getNodeTypes();
        workflowStore.setNodeTypes(nodeTypes);
      } catch (error) {
        console.error('Failed to load node types:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Create initial tab if none exist
  useEffect(() => {
    if (!loading && tabs.length === 0) {
      addTab();
      const newTab = useWorkflowTabStore.getState().tabs[0];
      if (newTab) {
        createInstance(newTab.id);
      }
    }
  }, [loading, tabs.length, addTab, createInstance]);

  // Sync active tab instance with global workflow store
  useEffect(() => {
    if (!activeTabId) return;

    const instance = getInstance(activeTabId);
    if (!instance) return;

    // Load instance data into global workflow store
    workflowStore.reset();
    workflowStore.setWorkflowName(instance.workflowName);
    if (instance.workflowDescription) {
      workflowStore.setWorkflowDescription(instance.workflowDescription);
    }
    
    // Set nodes and edges directly
    const state = useWorkflowStore.getState();
    useWorkflowStore.setState({
      ...state,
      workflowId: instance.workflowId,
      workflowName: instance.workflowName,
      workflowDescription: instance.workflowDescription,
      workflowStatus: instance.workflowStatus,
      nodes: instance.nodes,
      edges: instance.edges,
      pendingEdges: instance.pendingEdges,
      selectedNode: instance.selectedNode
    });
  }, [activeTabId]);

  // Save global workflow store back to instance when it changes
  useEffect(() => {
    if (!activeTabId) return;

    const unsubscribe = useWorkflowStore.subscribe((state) => {
      updateInstance(activeTabId, {
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        workflowStatus: state.workflowStatus,
        nodes: state.nodes,
        edges: state.edges,
        pendingEdges: state.pendingEdges,
        selectedNode: state.selectedNode
      });

      // Update tab name
      updateTabName(activeTabId, state.workflowName);
      
      // Mark as dirty (simple heuristic: has nodes or edges)
      markTabDirty(activeTabId, state.nodes.length > 0 || state.edges.length > 0);
    });

    return () => unsubscribe();
  }, [activeTabId]);

  const handleNewWorkflow = () => {
    addTab();
    const tabs = useWorkflowTabStore.getState().tabs;
    const newTab = tabs[tabs.length - 1];
    if (newTab) {
      createInstance(newTab.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Workflow Tabs */}
      <WorkflowTabs />

      {/* Active Workflow Editor */}
      {tabs.length > 0 ? (
        <WorkflowEditor />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">No workflow open</p>
            <button
              onClick={handleNewWorkflow}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
