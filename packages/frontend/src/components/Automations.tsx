import { useState, useEffect } from 'react';
import { Button, Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/overflow.js';
import '@ui5/webcomponents-icons/dist/process.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import { apiClient } from '../services/api';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { useWorkflowInstanceStore } from '../stores/workflowInstanceStore';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  updatedAt: string;
  createdAt: string;
  tags?: string[];
}

export const Automations: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const { addTab } = useWorkflowTabStore();
  const { createInstance } = useWorkflowInstanceStore();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/workflows');
      const result = await response.json();
      if (result.success) {
        setWorkflows(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    
    // Listen for workflow save events to refresh the list
    const handleWorkflowSaved = () => {
      fetchWorkflows();
    };
    
    window.addEventListener('workflow-saved', handleWorkflowSaved);
    
    return () => {
      window.removeEventListener('workflow-saved', handleWorkflowSaved);
    };
  }, []);

  const onDragStart = (event: React.DragEvent, workflow: Workflow) => {
    // Drag workflow as a subworkflow node
    event.dataTransfer.setData('application/reactflow', 'subworkflow');
    event.dataTransfer.setData('application/workflow', JSON.stringify(workflow));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleMenuClick = (workflowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === workflowId ? null : workflowId);
  };

  const handleMenuAction = async (action: string, workflowId: string) => {
    setMenuOpen(null);
    
    try {
      if (action === 'open') {
        // Load the workflow into the editor in a new tab
        const workflow = await apiClient.getWorkflow(workflowId);
        
        // Create a new tab for this workflow
        addTab({
          id: workflow.id,
          name: workflow.name
        });
        
        // Get the newly created tab ID
        const tabs = useWorkflowTabStore.getState().tabs;
        const newTab = tabs[tabs.length - 1];
        
        if (newTab) {
          // Create a workflow instance for this tab with the loaded workflow data
          createInstance(newTab.id, workflow);
        }
      } else if (action === 'duplicate') {
        // Duplicate the workflow
        const workflow = await apiClient.getWorkflow(workflowId);
        await apiClient.createWorkflow({
          ...workflow,
          name: `${workflow.name} (Copy)`,
          status: 'DRAFT'
        });
        
        // Refresh the list to show the duplicated workflow
        await fetchWorkflows();
        alert('Workflow duplicated successfully!');
      } else if (action === 'delete') {
        // Show delete confirmation
        setDeleteConfirm(workflowId);
      }
    } catch (error: any) {
      alert(`Failed to ${action} workflow: ${error.message}`);
    }
  };

  const confirmDelete = async (workflowId: string) => {
    try {
      await apiClient.deleteWorkflow(workflowId);
      setDeleteConfirm(null);
      await fetchWorkflows();
      alert('Workflow deleted successfully!');
    } catch (error: any) {
      alert(`Failed to delete workflow: ${error.message}`);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      case 'ERROR':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter workflows based on search and status
  const filteredWorkflows = workflows.filter(workflow => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'ALL' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Automations</h2>
          <Button
            icon="refresh"
            design="Transparent"
            tooltip="Refresh"
            onClick={() => fetchWorkflows()}
          />
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({workflows.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({workflows.filter(w => w.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                statusFilter === 'INACTIVE'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactive ({workflows.filter(w => w.status === 'INACTIVE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <Icon name="process" className="text-gray-300 text-4xl mb-2" />
            <p className="text-sm text-gray-500 mb-1">No workflows yet</p>
            <p className="text-xs text-gray-400">
              Save a workflow to use it as a subworkflow
            </p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <Icon name="process" className="text-gray-300 text-4xl mb-2" />
            <p className="text-sm text-gray-500 mb-1">No workflows found</p>
            <p className="text-xs text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              draggable
              onDragStart={(e) => onDragStart(e, workflow)}
              className="relative flex flex-col gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-move transition-colors group"
            >
              {/* Top row: Icon and Name */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
                  <Icon name="process" className="text-purple-600" />
                </div>

                {/* Name and status */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {workflow.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                        workflow.status
                      )}`}
                    >
                      {getStatusLabel(workflow.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(workflow.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Three-dot menu */}
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(workflow.id, e)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="More options"
                  >
                    <Icon name="overflow" />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === workflow.id && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(null)}
                      />

                      <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
                        <button
                          onClick={() => handleMenuAction('open', workflow.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8 1.33337V14.6667M1.33333 8H14.6667"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Open
                        </button>
                        <button
                          onClick={() => handleMenuAction('duplicate', workflow.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3.33333 10H2.66667C2.31304 10 1.97391 9.85952 1.72386 9.60947C1.47381 9.35943 1.33333 9.02029 1.33333 8.66667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H8.66667C9.02029 1.33333 9.35943 1.47381 9.60947 1.72386C9.85952 1.97391 10 2.31304 10 2.66667V3.33333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleMenuAction('delete', workflow.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4H3.33333H14"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33398 4.00004V2.66671C5.33398 2.31309 5.47446 1.97395 5.72451 1.7239C5.97456 1.47385 6.3137 1.33337 6.66732 1.33337H9.33398C9.68761 1.33337 10.0267 1.47385 10.2768 1.7239C10.5268 1.97395 10.6673 2.31309 10.6673 2.66671V4.00004M12.6673 4.00004V13.3334C12.6673 13.687 12.5268 14.0261 12.2768 14.2762C12.0267 14.5262 11.6876 14.6667 11.334 14.6667H4.66732C4.3137 14.6667 3.97456 14.5262 3.72451 14.2762C3.47446 14.0261 3.33398 13.687 3.33398 13.3334V4.00004H12.6673Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description (if exists) */}
              {workflow.description && (
                <p className="text-xs text-gray-500 line-clamp-2 ml-13">
                  {workflow.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={cancelDelete}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl p-6 min-w-[400px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Workflow</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this workflow? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={cancelDelete}
                design="Transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDelete(deleteConfirm)}
                design="Negative"
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
