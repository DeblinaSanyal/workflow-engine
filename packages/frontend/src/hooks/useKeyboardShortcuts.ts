import { useEffect, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';

interface KeyboardShortcutsOptions {
  onSave?: () => void;
  onExecute?: () => void;
}

export const useKeyboardShortcuts = (options?: KeyboardShortcutsOptions) => {
  const { onSave, onExecute } = options || {};
  const reactFlowInstance = useReactFlow();
  
  const {
    nodes,
    edges,
    deleteNode,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    selectAllNodes,
    undo,
    redo,
  } = useWorkflowStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      // Delete selected nodes (Delete or Backspace)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          selectedNodes.forEach((node) => deleteNode(node.id));
        }
        return;
      }

      // Copy (Ctrl/Cmd + C)
      if (modifierKey && event.key === 'c') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          copySelectedNodes();
        }
        return;
      }

      // Paste (Ctrl/Cmd + V)
      if (modifierKey && event.key === 'v') {
        event.preventDefault();
        pasteNodes();
        return;
      }

      // Cut (Ctrl/Cmd + X)
      if (modifierKey && event.key === 'x') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          copySelectedNodes();
          selectedNodes.forEach((node) => deleteNode(node.id));
        }
        return;
      }

      // Duplicate (Ctrl/Cmd + D)
      if (modifierKey && event.key === 'd') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          duplicateSelectedNodes();
        }
        return;
      }

      // Select All (Ctrl/Cmd + A)
      if (modifierKey && event.key === 'a') {
        event.preventDefault();
        selectAllNodes();
        return;
      }

      // Undo (Ctrl/Cmd + Z)
      if (modifierKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if (
        (modifierKey && event.shiftKey && event.key === 'z') ||
        (modifierKey && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
        return;
      }

      // Save (Ctrl/Cmd + S)
      if (modifierKey && event.key === 's') {
        event.preventDefault();
        onSave?.();
        return;
      }

      // Execute (Ctrl/Cmd + Enter)
      if (modifierKey && event.key === 'Enter') {
        event.preventDefault();
        onExecute?.();
        return;
      }

      // Fit view (Ctrl/Cmd + 0 or F)
      if ((modifierKey && event.key === '0') || event.key === 'f') {
        if (!modifierKey || event.key === '0') {
          event.preventDefault();
          reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        }
        return;
      }

      // Zoom in (Ctrl/Cmd + + or =)
      if (modifierKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        reactFlowInstance.zoomIn({ duration: 200 });
        return;
      }

      // Zoom out (Ctrl/Cmd + -)
      if (modifierKey && event.key === '-') {
        event.preventDefault();
        reactFlowInstance.zoomOut({ duration: 200 });
        return;
      }

      // Escape - deselect all
      if (event.key === 'Escape') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          // Deselect by updating all nodes to unselected
          const changes = selectedNodes.map((node) => ({
            id: node.id,
            type: 'select' as const,
            selected: false,
          }));
          useWorkflowStore.getState().onNodesChange(changes);
        }
        return;
      }
    },
    [
      nodes,
      edges,
      deleteNode,
      copySelectedNodes,
      pasteNodes,
      duplicateSelectedNodes,
      selectAllNodes,
      undo,
      redo,
      onSave,
      onExecute,
      reactFlowInstance,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Export keyboard shortcut definitions for display in UI
export const KEYBOARD_SHORTCUTS = [
  { key: 'Delete / Backspace', description: 'Delete selected nodes' },
  { key: 'Ctrl/Cmd + C', description: 'Copy selected nodes' },
  { key: 'Ctrl/Cmd + V', description: 'Paste nodes' },
  { key: 'Ctrl/Cmd + X', description: 'Cut selected nodes' },
  { key: 'Ctrl/Cmd + D', description: 'Duplicate selected nodes' },
  { key: 'Ctrl/Cmd + A', description: 'Select all nodes' },
  { key: 'Ctrl/Cmd + Z', description: 'Undo' },
  { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
  { key: 'Ctrl/Cmd + S', description: 'Save workflow' },
  { key: 'Ctrl/Cmd + Enter', description: 'Execute workflow' },
  { key: 'Ctrl/Cmd + 0 / F', description: 'Fit view' },
  { key: 'Ctrl/Cmd + +', description: 'Zoom in' },
  { key: 'Ctrl/Cmd + -', description: 'Zoom out' },
  { key: 'Escape', description: 'Deselect all nodes' },
];
