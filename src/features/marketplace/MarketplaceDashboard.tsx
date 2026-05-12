import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ForgeOS Marketplace</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/workspaces')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Workspaces
            </button>
            <button 
              onClick={() => navigate('/plugins')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Plugins
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Marketplace</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange('discover')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'discover' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Discover Extensions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('installed')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'installed' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Installed Extensions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('updates')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'updates' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Updates
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('details')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'details' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Extension Details
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">
                {activeTab === 'discover' && 'Discover Extensions'}
                {activeTab === 'installed' && 'Installed Extensions'}
                {activeTab === 'updates' && 'Available Updates'}
                {activeTab === 'details' && 'Extension Details'}
              </h2>

              {/* Placeholder content for each tab */}
              {activeTab === 'discover' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Discover New Extensions</h3>
                    <p className="text-gray-300">Browse and install extensions to enhance your ForgeOS experience.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-5/6 mb-4"></div>
                        <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'installed' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Installed Extensions</h3>
                    <p className="text-gray-300">Manage your installed extensions and their settings.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/2 mb-3"></div>
                        <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4 mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                          <div className="h-8 bg-gray-600 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Available Updates</h3>
                    <p className="text-gray-300">Update your installed extensions to the latest versions.</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-600 rounded w-1/6"></div>
                    </div>
                    <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-5/6 mb-4"></div>
                    <div className="h-8 bg-gray-600 rounded w-1/4"></div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Extension Details</h3>
                    <p className="text-gray-300">View detailed information about an extension.</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="h-32 bg-gray-600 rounded w-full md:w-1/4"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-600 rounded w-1/2 mb-3"></div>
                        <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded w-5/6 mb-4"></div>
                        <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
