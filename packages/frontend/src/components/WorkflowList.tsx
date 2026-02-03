import React, { useEffect, useState } from 'react';
import { apiClient, Workflow } from '../services/api';
import { Search, Clock, CheckCircle, XCircle, Tag, Plus, FileText, MoreVertical } from 'lucide-react';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { useWorkflowInstanceStore } from '../stores/workflowInstanceStore';

export const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { addTab } = useWorkflowTabStore();
  const { createInstance } = useWorkflowInstanceStore();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onDragStart = (event: React.DragEvent, workflow: Workflow) => {
    event.dataTransfer.setData('application/workflow', JSON.stringify(workflow));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNewWorkflow = () => {
    addTab(); // Add a new tab
    const tabs = useWorkflowTabStore.getState().tabs;
    const newTab = tabs[tabs.length - 1]; // Get the newly created tab
    if (newTab) {
      createInstance(newTab.id); // Create an empty instance for the new tab
    }
  };

  const handleOpenWorkflow = (workflow: Workflow) => {
    addTab(workflow); // Add tab with workflow data
    const tabs = useWorkflowTabStore.getState().tabs;
    const newTab = tabs[tabs.length - 1];
    if (newTab) {
      createInstance(newTab.id, workflow); // Create instance with workflow data
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle size={14} />;
      case 'INACTIVE':
        return <Clock size={14} />;
      case 'DRAFT':
        return <FileText size={14} />;
      case 'ERROR':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const handleChangeStatus = async (workflow: Workflow, newStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT') => {
    try {
      await apiClient.updateWorkflow(workflow.id, { status: newStatus });
      // Reload workflows
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow status:', error);
      alert('Failed to update workflow status');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white flex flex-col h-full shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span>Workflows</span>
          </h2>
          <button
            onClick={handleNewWorkflow}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            title="Create New Workflow"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Workflow Count Badge */}
        <div className="mt-3 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full inline-block">
          {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">
              {searchTerm ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm ? 'Try a different search term' : 'Create your first workflow to get started'}
            </p>
          </div>
        ) : (
          filteredWorkflows.map(workflow => {
            const isActive = workflow.status === 'ACTIVE';
            const isMenuOpen = openMenuId === workflow.id;
            
            return (
              <div
                key={workflow.id}
                draggable={isActive}
                onDragStart={(e) => {
                  if (isActive) {
                    onDragStart(e, workflow);
                  } else {
                    e.preventDefault();
                  }
                }}
                onDoubleClick={() => handleOpenWorkflow(workflow)}
                className={`bg-white p-4 rounded-lg border border-gray-200 transition-all relative ${
                  isActive 
                    ? 'cursor-move transform hover:scale-[1.02] hover:shadow-md hover:border-blue-300'
                    : 'cursor-pointer opacity-75 hover:opacity-100'
                }`}
                title={isActive ? 'Drag to canvas or double-click to edit' : 'Only active workflows can be dragged. Double-click to edit.'}
              >
                {/* Workflow Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
                      {workflow.name}
                      {!isActive && <span className="ml-2 text-[10px] text-gray-500">(not draggable)</span>}
                    </h3>
                    {workflow.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : workflow.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Change status"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {/* Status Dropdown Menu */}
                    {isMenuOpen && (
                      <>
                        {/* Backdrop to close menu */}
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        
                        <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(workflow, 'ACTIVE');
                              setOpenMenuId(null);
                            }}
                            disabled={workflow.status === 'ACTIVE'}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                              workflow.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-800 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <CheckCircle size={14} />
                            Active
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(workflow, 'INACTIVE');
                              setOpenMenuId(null);
                            }}
                            disabled={workflow.status === 'INACTIVE'}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                              workflow.status === 'INACTIVE'
                                ? 'bg-gray-50 text-gray-800 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Clock size={14} />
                            Inactive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(workflow, 'DRAFT');
                              setOpenMenuId(null);
                            }}
                            disabled={workflow.status === 'DRAFT'}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                              workflow.status === 'DRAFT'
                                ? 'bg-blue-50 text-blue-800 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <FileText size={14} />
                            Draft
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 ${getStatusColor(workflow.status)}`}>
                    {getStatusIcon(workflow.status)}
                    {workflow.status}
                  </span>
                </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <span className="font-medium">{workflow.nodes.length}</span> nodes
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">{workflow.connections.length}</span> connections
                </span>
              </div>

              {/* Tags */}
              {workflow.tags && workflow.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {workflow.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                  {workflow.tags.length > 3 && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      +{workflow.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Last Updated */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Footer Tip */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Only ACTIVE workflows can be dragged. Use the menu (⋮) to change status.
        </div>
      </div>
    </div>
  );
};
