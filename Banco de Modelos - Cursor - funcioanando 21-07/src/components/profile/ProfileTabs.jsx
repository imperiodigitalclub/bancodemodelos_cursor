import React from 'react';

const ProfileTabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex justify-center items-center space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;