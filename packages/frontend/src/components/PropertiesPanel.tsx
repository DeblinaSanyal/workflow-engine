import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { X } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const { selectedNode, updateNodeData, setSelectedNode } = useWorkflowStore();
  const [parameters, setParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setParameters(selectedNode.data.parameters || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center text-gray-500">
        <p>Select a node to configure</p>
      </div>
    );
  }

  const metadata = selectedNode.data.metadata;

  const handleParameterChange = (paramName: string, value: any) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
    updateNodeData(selectedNode.id, { parameters: newParameters });
  };

  const handleNameChange = (name: string) => {
    updateNodeData(selectedNode.id, { name });
  };

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name] ?? param.default;

    switch (param.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Enabled</span>
          </label>
        );

      case 'options':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {param.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParameterChange(param.name, parsed);
              } catch {
                handleParameterChange(param.name, e.target.value);
              }
            }}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder={param.placeholder}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Properties</h2>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Node Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Node Name
          </label>
          <input
            type="text"
            value={selectedNode.data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Node Type Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{metadata?.icon || '⚙️'}</span>
            <div>
              <p className="font-semibold text-sm">{metadata?.displayName}</p>
              <p className="text-xs text-gray-600">{metadata?.category}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{metadata?.description}</p>
        </div>

        {/* Parameters */}
        {metadata?.parameters && metadata.parameters.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Parameters</h3>
            <div className="space-y-4">
              {metadata.parameters.map((param: any) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {param.displayName}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {param.description && (
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                  )}
                  {renderParameterInput(param)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
