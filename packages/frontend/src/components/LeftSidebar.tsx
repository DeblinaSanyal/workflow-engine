import React, { useState } from 'react';
import { ArtifactLibrary } from './ArtifactLibrary';
import { Automations } from './Automations';

type TabType = 'artifacts' | 'automations';

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('artifacts');

  return (
    <div className="w-80 h-full flex flex-col bg-white border-r border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('artifacts')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'artifacts'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Artifact Library
        </button>
        <button
          onClick={() => setActiveTab('automations')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'automations'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Automations
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'artifacts' ? <ArtifactLibrary /> : <Automations />}
      </div>
    </div>
  );
};
