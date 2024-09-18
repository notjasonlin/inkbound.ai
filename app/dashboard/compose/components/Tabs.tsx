import React from 'react';

interface TabsProps {
  activeTab: 'All' | 'Division' | 'Location';
  setActiveTab: (tab: 'All' | 'Division' | 'Location') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ['All', 'Division', 'Location'] as const;

  return (
    <div className="flex border-b">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`flex-1 py-2 text-center ${
            activeTab === tab
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;