import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Mock data for installed extensions
  const installedExtensions = [
    {
      id: '1',
      name: 'Code Assistant',
      version: '1.2.3',
      description: 'AI-powered code assistance and suggestions',
      author: 'ForgeOS Team',
      isActive: true,
      hasUpdate: true,
      compatibility: 'Compatible',
      capabilities: ['code-completion', 'refactoring', 'debugging'],
      lastUpdated: '2023-05-15',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      dependencies: [
        { name: 'ForgeOS Core', version: '2.1.0', isInstalled: true, isCompatible: true },
        { name: 'AI Engine', version: '1.0.0', isInstalled: true, isCompatible: true }
      ]
    },
    {
      id: '2',
      name: 'Git Integration',
      version: '0.9.1',
      description: 'Enhanced Git operations and visualization',
      author: 'ForgeOS Team',
      isActive: false,
      hasUpdate: false,
      compatibility: 'Compatible',
      capabilities: ['git-operations', 'branch-management', 'merge-conflicts'],
      lastUpdated: '2023-04-22',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      dependencies: [
        { name: 'ForgeOS Core', version: '2.1.0', isInstalled: true, isCompatible: true }
      ]
    },
    {
      id: '3',
      name: 'Database Explorer',
      version: '2.1.0',
      description: 'Visual database management and querying',
      author: 'ForgeOS Team',
      isActive: true,
      hasUpdate: true,
      compatibility: 'Incompatible',
      capabilities: ['sql-editor', 'schema-explorer', 'data-import'],
      lastUpdated: '2023-06-01',
      compatibilityDetails: {
        forgeosVersion: '>=3.0.0',
        nodeVersion: '>=16.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      dependencies: [
        { name: 'ForgeOS Core', version: '2.1.0', isInstalled: true, isCompatible: true },
        { name: 'Database Driver', version: '1.0.0', isInstalled: false, isCompatible: true }
      ]
    }
  ];

  // Mock data for extension details
  const extensionDetails = {
    id: '1',
    name: 'Code Assistant',
    version: '1.2.3',
    description: 'AI-powered code assistance and suggestions that helps developers write better code faster. Features include intelligent code completion, refactoring suggestions, and debugging support.',
    author: 'ForgeOS Team',
    authorId: 'forgeos-team',
    authorAvatar: '',
    isActive: true,
    hasUpdate: true,
    compatibility: 'Compatible',
    capabilities: ['code-completion', 'refactoring', 'debugging'],
    lastUpdated: '2023-05-15',
    installedAt: '2023-03-10',
    downloads: 12500,
    rating: 4.8,
    license: 'MIT',
    repository: 'https://github.com/forgeos/code-assistant',
    documentation: 'https://docs.forgeos.dev/code-assistant',
    category: 'Development Tools',
    tags: ['ai', 'code', 'assistant', 'productivity'],
    versionHistory: [
      { version: '1.2.3', date: '2023-05-15', changes: 'Bug fixes and performance improvements' },
      { version: '1.2.2', date: '2023-04-20', changes: 'Added new code completion models' },
      { version: '1.2.1', date: '2023-03-15', changes: 'Improved debugging support' },
      { version: '1.2.0', date: '2023-02-10', changes: 'Major refactor and new features' },
    ],
    permissions: [
      { name: 'read-files', description: 'Read files in the workspace' },
      { name: 'write-files', description: 'Write files in the workspace' },
      { name: 'execute-commands', description: 'Execute system commands' },
    ],
    dependencies: [
      { name: 'ForgeOS Core', version: '2.1.0', isInstalled: true, isCompatible: true },
      { name: 'AI Engine', version: '1.0.0', isInstalled: true, isCompatible: true },
      { name: 'Database Driver', version: '1.0.0', isInstalled: false, isCompatible: true }
    ],
    isInstalled: true,
    isUpdateAvailable: true,
    isCompatible: true,
    compatibilityDetails: {
      forgeosVersion: '>=2.0.0',
      nodeVersion: '>=14.0.0',
      os: ['Windows', 'macOS', 'Linux']
    }
  };

  // Mock data for extension in discover view
  const discoverExtensions = [
    {
      id: '1',
      name: 'Code Assistant',
      version: '1.2.3',
      description: 'AI-powered code assistance and suggestions',
      author: 'ForgeOS Team',
      rating: 4.8,
      downloads: 12500,
      category: 'Development Tools',
      tags: ['ai', 'code', 'assistant'],
      isInstalled: true,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      }
    },
    {
      id: '2',
      name: 'Git Integration',
      version: '0.9.1',
      description: 'Enhanced Git operations and visualization',
      author: 'ForgeOS Team',
      rating: 4.5,
      downloads: 8900,
      category: 'Development Tools',
      tags: ['git', 'version-control'],
      isInstalled: false,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      }
    },
    {
      id: '3',
      name: 'Database Explorer',
      version: '2.1.0',
      description: 'Visual database management and querying',
      author: 'ForgeOS Team',
      rating: 4.7,
      downloads: 6700,
      category: 'Database Tools',
      tags: ['database', 'sql', 'explorer'],
      isInstalled: true,
      compatibility: 'Incompatible',
      compatibilityDetails: {
        forgeosVersion: '>=3.0.0',
        nodeVersion: '>=16.0.0',
        os: ['Windows', 'macOS', 'Linux']
      }
    }
  ];

  // Mock marketplace status data
  const marketplaceStatus = {
    catalogStatus: 'synced', // synced, syncing, error, unavailable
    lastSync: '2023-06-15 14:30:00',
    syncEnabled: true,
    syncAvailable: true,
    hasUpdates: true,
    error: null,
    warning: null,
    serviceStatus: 'healthy', // healthy, degraded, unhealthy
    lastAction: {
      type: 'install',
      status: 'success',
      timestamp: '2023-06-15 14:25:00',
      message: 'Successfully installed Code Assistant v1.2.3'
    }
  };

  // Status badge component
  const StatusBadge = ({ status, label }: { status: string; label: string }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-300';
    
    switch (status) {
      case 'synced':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'syncing':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'error':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'unavailable':
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-400';
        break;
      case 'healthy':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'degraded':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'unhealthy':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'compatible':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'incompatible':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'unknown':
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-300';
        break;
      case 'missing':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-300';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs`}>
        {label}
      </span>
    );
  };

  // Status banner component
  const StatusBanner = ({ type, message }: { type: string; message: string }) => {
    let bgColor = 'bg-gray-700';
    let textColor = 'text-gray-300';
    
    switch (type) {
      case 'error':
        bgColor = 'bg-red-900';
        textColor = 'text-red-200';
        break;
      case 'warning':
        bgColor = 'bg-yellow-900';
        textColor = 'text-yellow-200';
        break;
      case 'success':
        bgColor = 'bg-green-900';
        textColor = 'text-green-200';
        break;
      default:
        bgColor = 'bg-gray-700';
        textColor = 'text-gray-300';
    }
    
    return (
      <div className={`${bgColor} ${textColor} p-3 rounded-lg mb-4 flex items-center`}>
        <span className="mr-2">⚠️</span>
        <span>{message}</span>
      </div>
    );
  };

  // Dependency badge component
  const DependencyBadge = ({ status }: { status: string }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-300';
    
    switch (status) {
      case 'installed':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'missing':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'incompatible':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-300';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs`}>
        {status}
      </span>
    );
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

        {/* Marketplace Status Summary */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Marketplace Status</h2>
              <p className="text-gray-400 text-sm">Real-time extension catalog and service status</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={marketplaceStatus.catalogStatus} label="Catalog Status" />
              <StatusBadge status={marketplaceStatus.serviceStatus} label="Service Status" />
              {marketplaceStatus.hasUpdates && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                  Updates Available
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Last sync:</span>
              <span className="text-white">{marketplaceStatus.lastSync}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Sync enabled:</span>
              <span className={`font-medium ${marketplaceStatus.syncEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {marketplaceStatus.syncEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Sync available:</span>
              <span className={`font-medium ${marketplaceStatus.syncAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {marketplaceStatus.syncAvailable ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Banner */}
        {marketplaceStatus.lastAction && (
          <StatusBanner 
            type={marketplaceStatus.lastAction.status} 
            message={marketplaceStatus.lastAction.message} 
          />
        )}

        {/* Status Indicators for Installed Extensions */}
        {activeTab === 'installed' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Extension Status</h3>
              <span className="text-sm text-gray-400">Local-only mode</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs flex items-center">
                <span className="mr-1">🔒</span> Local-only
              </span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                No external communication
              </span>
            </div>
          </div>
        )}

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
                    {discoverExtensions.map((extension) => (
                      <div key={extension.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white">{extension.name}</h3>
                            <p className="text-gray-300 text-sm">v{extension.version}</p>
                          </div>
                          {extension.isInstalled && (
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                              Installed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-3">{extension.description}</p>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-400">
                            {extension.author}
                          </span>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-sm text-gray-400">{extension.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {extension.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            <StatusBadge status={extension.compatibility} label={extension.compatibility} />
                          </div>
                          <span className="text-sm text-gray-400">
                            {extension.downloads.toLocaleString()} downloads
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-1">
                            {extension.compatibilityDetails.os.map((os, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                                {os}
                              </span>
                            ))}
                          </div>
                          <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200">
                            {extension.isInstalled ? 'Manage' : 'Install'}
                          </button>
                        </div>
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
                  
                  {installedExtensions.length === 0 ? (
                    <div className="bg-gray-700 rounded-lg p-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">No Extensions Installed</h3>
                      <p className="text-gray-300 mb-4">Install extensions from the Discover tab to get started.</p>
                      <button 
                        onClick={() => handleTabChange('discover')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Discover Extensions
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {installedExtensions.map((extension) => (
                        <div key={extension.id} className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">{extension.name}</h3>
                              <p className="text-gray-300 text-sm">v{extension.version}</p>
                            </div>
                            <div className="flex space-x-2">
                              {extension.hasUpdate && (
                                <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded text-xs">
                                  Update Available
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                extension.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}>
                                {extension.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 mb-3">{extension.description}</p>
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-400">
                              {extension.author}
                            </span>
                            <div className="flex items-center">
                              <StatusBadge status={extension.compatibility} label={extension.compatibility} />
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {extension.capabilities.map((capability, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                                {capability}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Compatibility</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-gray-400">ForgeOS:</span>
                              <span className="text-xs text-white">{extension.compatibilityDetails.forgeosVersion}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-gray-400">Node.js:</span>
                              <span className="text-xs text-white">{extension.compatibilityDetails.nodeVersion}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {extension.compatibilityDetails.os.map((os, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                                  {os}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Dependencies</h4>
                            <div className="space-y-2">
                              {extension.dependencies.map((dep, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-white">{dep.name} v{dep.version}</span>
                                  <DependencyBadge status={dep.isInstalled ? 'installed' : dep.isCompatible ? 'missing' : 'incompatible'} />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                              Installed: {extension.lastUpdated}
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200">
                                Settings
                              </button>
                              <button className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200">
                                Uninstall
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                <div className="space-y-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Extension Details</h3>
                    <p className="text-gray-300">View detailed information about an extension.</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    {/* Extension Header */}
                    <div className="p-6 border-b border-gray-600">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <div className="bg-gray-600 rounded-lg w-24 h-24 flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                              <h2 className="text-2xl font-bold">{extensionDetails.name}</h2>
                              <div className="flex items-center mt-1">
                                <span className="text-gray-300 mr-2">v{extensionDetails.version}</span>
                                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                  {extensionDetails.isInstalled ? 'Installed' : 'Not Installed'}
                                </span>
                                {extensionDetails.isUpdateAvailable && (
                                  <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded text-xs ml-2">
                                    Update Available
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                                {extensionDetails.isInstalled ? 'Manage' : 'Install'}
                              </button>
                              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-200">
                                Details
                              </button>
                            </div>
                          </div>
                          
                          <p className="mt-4 text-gray-300">{extensionDetails.description}</p>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                              {extensionDetails.category}
                            </span>
                            {extensionDetails.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex items-center">
                            <div className="flex items-center mr-4">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-gray-300">{extensionDetails.rating}</span>
                            </div>
                            <span className="text-gray-400 mr-4">{extensionDetails.downloads.toLocaleString()} downloads</span>
                            <span className="text-gray-400">{extensionDetails.license}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Extension Overview */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Publisher</h4>
                          <div className="flex items-center">
                            <div className="bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                              <span className="text-sm">F</span>
                            </div>
                            <span className="text-white">{extensionDetails.author}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Compatibility</h4>
                          <div className="flex items-center">
                            <StatusBadge status={extensionDetails.compatibility} label={extensionDetails.compatibility} />
                            <span className="text-gray-300 ml-2">{extensionDetails.compatibility}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Installation Date</h4>
                          <p className="text-white">{extensionDetails.installedAt}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Last Updated</h4>
                          <p className="text-white">{extensionDetails.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Metadata</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Repository</h4>
                          <a href={extensionDetails.repository} className="text-blue-400 hover:text-blue-300">
                            {extensionDetails.repository}
                          </a>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Documentation</h4>
                          <a href={extensionDetails.documentation} className="text-blue-400 hover:text-blue-300">
                            {extensionDetails.documentation}
                          </a>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">License</h4>
                          <p className="text-white">{extensionDetails.license}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Category</h4>
                          <p className="text-white">{extensionDetails.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Capabilities */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Capabilities & Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Capabilities</h4>
                          <div className="flex flex-wrap gap-2">
                            {extensionDetails.capabilities.map((capability, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Required Permissions</h4>
                          <div className="space-y-2">
                            {extensionDetails.permissions.map((permission, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-blue-400 mr-2">•</span>
                                <div>
                                  <p className="text-white font-medium">{permission.name}</p>
                                  <p className="text-gray-300 text-sm">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Compatibility */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Compatibility</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Operating Systems</h4>
                          <div className="flex flex-wrap gap-2">
                            {extensionDetails.compatibilityDetails.os.map((os, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                                {os}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">System Requirements</h4>
                          <ul className="list-disc pl-5 text-gray-300 space-y-1">
                            <li>ForgeOS version: {extensionDetails.compatibilityDetails.forgeosVersion}</li>
                            <li>Node.js version: {extensionDetails.compatibilityDetails.nodeVersion}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dependencies */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Dependencies</h3>
                      <div className="space-y-4">
                        {extensionDetails.dependencies.map((dep, index) => (
                          <div key={index} className="p-4 bg-gray-600 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-white">{dep.name}</h4>
                              <DependencyBadge status={dep.isInstalled ? 'installed' : dep.isCompatible ? 'missing' : 'incompatible'} />
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-300">Version: {dep.version}</p>
                              <div className="flex space-x-2">
                                {dep.isInstalled ? (
                                  <span className="text-green-400 text-sm">Installed</span>
                                ) : (
                                  <span className="text-yellow-400 text-sm">Missing</span>
                                )}
                              </div>
                            </div>
                            {dep.isCompatible === false && (
                              <div className="mt-2 p-2 bg-red-900 text-red-100 rounded text-sm">
                                <p className="font-semibold">Incompatible</p>
                                <p>This dependency is not compatible with your current environment.</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Version History */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Version History</h3>
                      <div className="space-y-3">
                        {extensionDetails.versionHistory.map((version, index) => (
                          <div key={index} className="flex items-start p-3 bg-gray-600 rounded-lg">
                            <div className="flex-shrink-0 mr-4">
                              <div className="bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-sm">v{version.version}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="text-white font-medium mr-2">v{version.version}</span>
                                <span className="text-gray-400 text-sm">{version.date}</span>
                              </div>
                              <p className="text-gray-300 mt-1">{version.changes}</p>
                            </div>
                          </div>
                        ))}
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
