import React, { useState } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { apiClient } from '../services/api';
import { useWorkflowTabStore } from '../stores/workflowTabStore';
import { Button, Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/save.js';
import '@ui5/webcomponents-icons/dist/activate.js';
import '@ui5/webcomponents-icons/dist/overflow.js';
import '@ui5/webcomponents-icons/dist/copy.js';
import '@ui5/webcomponents-icons/dist/download.js';
import '@ui5/webcomponents-icons/dist/history.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js';
import '@ui5/webcomponents-icons/dist/upload.js';
import '@ui5/webcomponents-icons/dist/decline.js';

interface WorkflowToolbarProps {}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = () => {
  const {
    workflowId,
    workflowName,
    workflowStatus,
    nodes,
    edges,
    setWorkflowName,
    toWorkflowData,
    setWorkflow,
    reset
  } = useWorkflowStore();

  const { updateTabWorkflowId, markTabDirty, getActiveTab } = useWorkflowTabStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(workflowName);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      alert('Workflow name cannot be empty');
      return;
    }

    setWorkflowName(tempName);
    setIsEditingName(false);

    // If workflow is already saved, update it in the backend
    if (workflowId) {
      try {
        const updated = await apiClient.updateWorkflow(workflowId, { name: tempName });
        setWorkflow(updated);
        
        const activeTab = getActiveTab();
        if (activeTab) {
          markTabDirty(activeTab.id, false);
        }
      } catch (error: any) {
        console.error('Failed to update workflow name:', error);
        // Don't show error to user since the local state is updated
        // The name will be saved on next full save
      }
    }
  };

  const handleCancelEditName = () => {
    setTempName(workflowName);
    setIsEditingName(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const workflowData = toWorkflowData();

      let savedWorkflow;
      if (workflowId) {
        savedWorkflow = await apiClient.updateWorkflow(workflowId, workflowData);
      } else {
        savedWorkflow = await apiClient.createWorkflow(workflowData);
      }

      setWorkflow(savedWorkflow);
      
      const activeTab = getActiveTab();
      if (activeTab && savedWorkflow.id) {
        updateTabWorkflowId(activeTab.id, savedWorkflow.id);
        markTabDirty(activeTab.id, false);
      }
      
      // Dispatch event to notify Automations component to refresh
      window.dispatchEvent(new CustomEvent('workflow-saved', { detail: savedWorkflow }));
      
      alert('Workflow saved successfully!');
    } catch (error: any) {
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) {
      alert('Please save the workflow before publishing');
      return;
    }

    try {
      setIsExecuting(true);
      const execution = await apiClient.executeWorkflow(workflowId);
      alert(`Workflow published! Status: ${execution.status}`);
    } catch (error: any) {
      alert(`Failed to publish workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleChangeStatus = async (newStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT') => {
    if (!workflowId) return;

    try {
      const updated = await apiClient.updateWorkflow(workflowId, { status: newStatus });
      setWorkflow(updated);
      setIsStatusMenuOpen(false);
      
      const activeTab = getActiveTab();
      if (activeTab) {
        markTabDirty(activeTab.id, false);
      }
    } catch (error: any) {
      alert(`Failed to update workflow status: ${error.message}`);
    }
  };

  const handleDuplicateProcess = async () => {
    try {
      // Get the current workflow data
      const workflowData = toWorkflowData();
      
      // Create a new workflow with "(Copy)" suffix
      const duplicatedWorkflow = {
        ...workflowData,
        name: `${workflowName} (Copy)`,
        status: 'DRAFT' as const
      };
      
      // Save the duplicated workflow
      const savedWorkflow = await apiClient.createWorkflow(duplicatedWorkflow);
      
      // Load the duplicated workflow into the editor
      setWorkflow(savedWorkflow);
      
      const activeTab = getActiveTab();
      if (activeTab && savedWorkflow.id) {
        updateTabWorkflowId(activeTab.id, savedWorkflow.id);
        markTabDirty(activeTab.id, false);
      }
      
      // Dispatch event to notify Automations component to refresh
      window.dispatchEvent(new CustomEvent('workflow-saved', { detail: savedWorkflow }));
      
      alert('Workflow duplicated successfully!');
      setIsActionsMenuOpen(false);
    } catch (error: any) {
      alert(`Failed to duplicate workflow: ${error.message}`);
    }
  };

  const handleExportProcess = () => {
    try {
      // Get the complete workflow data
      const workflowData = toWorkflowData();
      
      // Create a complete export object with metadata
      const exportData = {
        ...workflowData,
        id: workflowId,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        // Include node metadata for better portability
        nodeTypesUsed: nodes.map(node => ({
          type: node.data.type,
          displayName: node.data.name,
          metadata: node.data.metadata
        }))
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create a Blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with workflow name and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedName = workflowName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${sanitizedName}_${timestamp}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsActionsMenuOpen(false);
    } catch (error: any) {
      alert(`Failed to export workflow: ${error.message}`);
    }
  };

  const handleActivityHistory = async () => {
    setIsActionsMenuOpen(false);
    
    if (!workflowId) {
      alert('Please save the workflow first to see execution history');
      return;
    }

    try {
      const result = await apiClient.getWorkflowExecutions(workflowId, { limit: 20 });
      setExecutions(result.data);
      setIsActivityHistoryOpen(true);
    } catch (error: any) {
      alert(`Failed to load execution history: ${error.message}`);
    }
  };

  const closeActivityHistory = () => {
    setIsActivityHistoryOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseWorkflow = () => {
    // Check if there are unsaved changes
    const hasChanges = nodes.length > 0 || edges.length > 0;
    
    if (hasChanges && workflowId) {
      const confirmClose = window.confirm(
        'Are you sure you want to close this workflow? Any unsaved changes will be lost.'
      );
      if (!confirmClose) return;
    }
    
    // Reset the workflow store to empty state
    reset();
    
    // Note: Tab management will handle itself, we just reset the workflow state
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate the imported data has required fields
      if (!importedData.name || !importedData.nodes || !importedData.connections) {
        throw new Error('Invalid workflow file format');
      }

      // Create a new workflow from imported data
      const workflowToImport = {
        name: `${importedData.name} (Imported)`,
        description: importedData.description || 'Imported workflow',
        nodes: importedData.nodes,
        connections: importedData.connections,
        status: 'DRAFT' as const
      };

      const savedWorkflow = await apiClient.createWorkflow(workflowToImport);
      setWorkflow(savedWorkflow);

      const activeTab = getActiveTab();
      if (activeTab && savedWorkflow.id) {
        updateTabWorkflowId(activeTab.id, savedWorkflow.id);
        markTabDirty(activeTab.id, false);
      }

      // Dispatch event to notify Automations component to refresh
      window.dispatchEvent(new CustomEvent('workflow-saved', { detail: savedWorkflow }));

      alert('Workflow imported successfully!');
    } catch (error: any) {
      alert(`Failed to import workflow: ${error.message}`);
    }

    // Reset the file input
    event.target.value = '';
  };

  const handleDeleteProcess = () => {
    setIsActionsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProcess = async () => {
    if (!workflowId) {
      alert('No workflow to delete');
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      await apiClient.deleteWorkflow(workflowId);
      
      // Reset the workflow store to show empty canvas
      const { reset } = useWorkflowStore.getState();
      reset();
      
      alert('Workflow deleted successfully!');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      alert(`Failed to delete workflow: ${error.message}`);
    }
  };

  const cancelDeleteProcess = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500">Build</div>
        <div className="text-sm text-gray-300">|</div>
        <div className="text-sm text-gray-500">Process Automation</div>
      </div>

      {/* Center: Workflow Title and Status */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEditName();
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Icon name="accept" />
            </button>
            <button
              onClick={handleCancelEditName}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <Icon name="decline" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-lg font-semibold text-gray-900">{workflowName}</h1>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Rename workflow"
            >
              <Icon name="edit" />
            </button>
            {workflowId && (
              <button
                onClick={handleCloseWorkflow}
                className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Close workflow"
              >
                <Icon name="decline" />
              </button>
            )}
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded text-xs font-medium ${
            workflowStatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : workflowStatus === 'DRAFT'
              ? 'bg-gray-100 text-gray-600'
              : workflowStatus === 'ERROR'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {workflowStatus === 'DRAFT' ? 'Draft' : workflowStatus}
        </span>
        
        <button
          onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Icon name="slim-arrow-down" />
        </button>

        {/* Status Dropdown */}
        {isStatusMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsStatusMenuOpen(false)}
            />
            
            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => handleChangeStatus('ACTIVE')}
                disabled={workflowStatus === 'ACTIVE'}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                  workflowStatus === 'ACTIVE'
                    ? 'bg-green-50 text-green-800 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleChangeStatus('INACTIVE')}
                disabled={workflowStatus === 'INACTIVE'}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                  workflowStatus === 'INACTIVE'
                    ? 'bg-gray-50 text-gray-800 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Inactive
              </button>
              <button
                onClick={() => handleChangeStatus('DRAFT')}
                disabled={workflowStatus === 'DRAFT'}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                  workflowStatus === 'DRAFT'
                    ? 'bg-blue-50 text-blue-800 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Draft
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions Menu */}
      <div className="flex items-center gap-3">
        {/* Import Workflow Button */}
        <button 
          onClick={handleImportClick}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="Import Workflow"
        >
          <Icon name="upload" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
        
        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="5" r="1" fill="currentColor"/>
            <circle cx="12" cy="19" r="1" fill="currentColor"/>
          </svg>
        </button>

        {/* Actions dropdown menu */}
        <div className="relative">
          <button 
            onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Icon name="overflow" />
          </button>

          {isActionsMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsActionsMenuOpen(false)}
              />
              
              <div className="absolute right-0 top-12 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]">
                <button
                  onClick={handleDuplicateProcess}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Icon name="copy" />
                  Duplicate Process
                </button>
                <button
                  onClick={handleExportProcess}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Icon name="download" />
                  Export Process
                </button>
                <button
                  onClick={handleActivityHistory}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Icon name="history" />
                  Activity History
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleDeleteProcess}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <Icon name="delete" />
                  Delete Process
                </button>
              </div>
            </>
          )}
        </div>

        {/* Save and Publish buttons with UI5 */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          design="Default"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button
          onClick={handleExecute}
          disabled={isExecuting || !workflowId}
          design="Emphasized"
        >
          {isExecuting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={cancelDeleteProcess}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl p-6 min-w-[400px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Workflow</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{workflowName}</span>"? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={cancelDeleteProcess}
                design="Transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteProcess}
                design="Negative"
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Activity History Modal */}
      {isActivityHistoryOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeActivityHistory}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-[800px] max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Activity History</h2>
              <button
                onClick={closeActivityHistory}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Showing {executions.length} recent executions for <span className="font-medium">{workflowName}</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-gray-300">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-sm">No execution history yet</p>
                  <p className="text-xs mt-1">Publish the workflow to see executions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                execution.status === 'SUCCESS'
                                  ? 'bg-green-100 text-green-800'
                                  : execution.status === 'ERROR'
                                  ? 'bg-red-100 text-red-800'
                                  : execution.status === 'RUNNING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : execution.status === 'WAITING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {execution.status}
                            </span>
                            
                            <span className="text-xs text-gray-500">
                              {execution.mode}
                            </span>

                            {execution.executionTime && (
                              <span className="text-xs text-gray-500">
                                {execution.executionTime}ms
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-700 mb-1">
                            Execution ID: <span className="font-mono text-xs">{execution.id}</span>
                          </div>

                          <div className="text-xs text-gray-500">
                            Started: {new Date(execution.createdAt).toLocaleString()}
                          </div>

                          {execution.errorMessage && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                              {execution.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button
                onClick={closeActivityHistory}
                design="Default"
              >
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
