import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabbedWorkflowEditor } from './components/TabbedWorkflowEditor';
import { ThemeProvider } from '@ui5/webcomponents-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TabbedWorkflowEditor />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
