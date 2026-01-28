import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowsList } from './pages/WorkflowsList';
import { WorkflowEditor } from './components/WorkflowEditor';
import { useWorkflowStore } from './stores/workflowStore';
import { apiClient } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const WorkflowEditorPage: React.FC = () => {
  const { setNodeTypes, reset, setWorkflow } = useWorkflowStore();
  const [loading, setLoading] = React.useState(true);
  const workflowId = window.location.pathname.split('/')[2];

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load node types
        const nodeTypes = await apiClient.getNodeTypes();
        setNodeTypes(nodeTypes);

        // Load existing workflow if editing
        if (workflowId && workflowId !== 'new') {
          const workflow = await apiClient.getWorkflow(workflowId);
          setWorkflow(workflow);
        } else {
          reset();
        }
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading editor...</div>
      </div>
    );
  }

  return <WorkflowEditor />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowsList />} />
          <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
          <Route path="*" element={<Navigate to="/workflows" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
