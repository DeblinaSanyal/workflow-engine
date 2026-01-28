import React, { useState } from 'react';
import { Save, Play, Edit2, Check, X, Loader2, List } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflowStore';
import { apiClient } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const WorkflowToolbar: React.FC = () => {
  const {
    workflowId,
    workflowName,
    workflowStatus,
    setWorkflowName,
    toWorkflowData,
    setWorkflow
  } = useWorkflowStore();

  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(workflowName);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSaveName = () => {
    setWorkflowName(tempName);
    setIsEditingName(false);
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
        // Update existing workflow
        savedWorkflow = await apiClient.updateWorkflow(workflowId, workflowData);
      } else {
        // Create new workflow
        savedWorkflow = await apiClient.createWorkflow(workflowData);
      }

      setWorkflow(savedWorkflow);
      alert('Workflow saved successfully!');
    } catch (error: any) {
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) {
      alert('Please save the workflow before executing');
      return;
    }

    try {
      setIsExecuting(true);
      const execution = await apiClient.executeWorkflow(workflowId);
      alert(`Execution started! Status: ${execution.status}`);
      // Optionally navigate to execution details
      navigate(`/executions/${execution.id}`);
    } catch (error: any) {
      alert(`Failed to execute workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!workflowId) return;

    try {
      if (workflowStatus === 'ACTIVE') {
        const updated = await apiClient.deactivateWorkflow(workflowId);
        setWorkflow(updated);
      } else {
        const updated = await apiClient.activateWorkflow(workflowId);
        setWorkflow(updated);
      }
    } catch (error: any) {
      alert(`Failed to update workflow status: ${error.message}`);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left: Workflow Name */}
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
              <Check size={20} />
            </button>
            <button
              onClick={handleCancelEditName}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">{workflowName}</h1>
            <button
              onClick={() => {
                setTempName(workflowName);
                setIsEditingName(true);
              }}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            workflowStatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : workflowStatus === 'ERROR'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {workflowStatus}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <List size={18} />
          <span>All Workflows</span>
        </button>

        {workflowId && (
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg transition-colors ${
              workflowStatus === 'ACTIVE'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {workflowStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{workflowId ? 'Save' : 'Save New'}</span>
        </button>

        <button
          onClick={handleExecute}
          disabled={isExecuting || !workflowId}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};
