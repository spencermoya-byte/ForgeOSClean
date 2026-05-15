import React, { useState, useEffect, useCallback } from 'react';

const MarketplaceDashboard: React.FC = () => {
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isUninstalling, setIsUninstalling] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [updateProgress, setUpdateProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [installedExtensions, setInstalledExtensions] = useState<any[]>([]);
  const [discoverExtensions, setDiscoverExtensions] = useState<any[]>([]);

  // Simulate installation with proper state management
  const installExtension = useCallback((extensionId: string) => {
    if (isInstalling === extensionId || isUpdating === extensionId || isUninstalling === extensionId) return;
    
    setIsInstalling(extensionId);
    
    // Set initial progress state
    setInstallProgress(prev => ({
      ...prev,
      [extensionId]: { progress: 0, status: 'Preparing installation' }
    }));
    
    // Simulate installation progress
    const progressInterval = setInterval(() => {
      setInstallProgress(prev => {
        const currentProgress = prev[extensionId]?.progress || 0;
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        return {
          ...prev,
          [extensionId]: { 
            progress: Math.min(currentProgress + 10, 100), 
            status: currentProgress < 30 ? 'Downloading' : 
                   currentProgress < 60 ? 'Preparing' : 
                   currentProgress < 90 ? 'Installing' : 'Finalizing'
          }
        };
      });
    }, 200);
    
    // Simulate installation completion
    setTimeout(() => {
      clearInterval(progressInterval);
      
      // Update extension state with better error handling
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccess) {
        setInstalledExtensions(prev => [
          ...prev,
          {
            id: extensionId,
            name: 'Sample Extension',
            version: '1.0.0',
            description: 'Sample extension description',
            author: 'Sample Author',
            isInstalled: true,
            updateStatus: 'up_to_date',
            lastUpdated: new Date().toISOString().split('T')[0],
            hasUpdate: false
          }
        ]);
        
        // Remove progress tracking after completion
        setInstallProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[extensionId];
          return newProgress;
        });
      } else {
        // Handle installation failure gracefully
        setInstallProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[extensionId];
          return newProgress;
        });
      }
      
      setIsInstalling(null);
    }, 2000);
  }, [isInstalling, isUpdating, isUninstalling]);

  // Update extension with proper state management and progress tracking
  const updateExtension = useCallback((extensionId: string) => {
    if (isInstalling === extensionId || isUpdating === extensionId || isUninstalling === extensionId) return;
    
    setIsUpdating(extensionId);
    
    // Set initial progress state
    setUpdateProgress(prev => ({
      ...prev,
      [extensionId]: { progress: 0, status: 'Preparing update' }
    }));
    
    // Simulate update progress with better error handling
    const progressInterval = setInterval(() => {
      setUpdateProgress(prev => {
        const currentProgress = prev[extensionId]?.progress || 0;
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        return {
          ...prev,
          [extensionId]: { 
            progress: Math.min(currentProgress + 10, 100), 
            status: currentProgress < 30 ? 'Downloading' : 
                   currentProgress < 60 ? 'Preparing' : 
                   currentProgress < 90 ? 'Installing' : 'Finalizing'
          }
        };
      });
    }, 200);
    
    // Simulate update completion with better error handling
    setTimeout(() => {
      clearInterval(progressInterval);
      
      // Update extension version with better error handling
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccess) {
        setInstalledExtensions(prev => 
          prev.map(ext => 
            ext.id === extensionId ? { 
              ...ext, 
              version: '1.3.0', 
              updateStatus: 'up_to_date',
              lastUpdated: new Date().toISOString().split('T')[0],
              // Clear update available badge
              hasUpdate: false
            } : ext
          )
        );
        
        setDiscoverExtensions(prev => 
          prev.map(ext => 
            ext.id === extensionId ? { 
              ...ext, 
              version: '1.3.0', 
              updateStatus: 'up_to_date',
              lastUpdated: new Date().toISOString().split('T')[0],
              // Clear update available badge
              hasUpdate: false
            } : ext
          )
        );
        
        // Remove progress tracking after completion
        setUpdateProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[extensionId];
          return newProgress;
        });
      } else {
        // Handle update failure gracefully
        setUpdateProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[extensionId];
          return newProgress;
        });
        // In a real app, we would show an error message
      }
      
      setIsUpdating(null);
    }, 2000);
  }, [isInstalling, isUpdating, isUninstalling]);

  // Uninstall extension
  const uninstallExtension = useCallback((extensionId: string) => {
    if (isInstalling === extensionId || isUpdating === extensionId || isUninstalling === extensionId) return;
    
    setIsUninstalling(extensionId);
    
    // Simulate uninstallation
    setTimeout(() => {
      setInstalledExtensions(prev => prev.filter(ext => ext.id !== extensionId));
      setIsUninstalling(null);
    }, 1000);
  }, [isInstalling, isUpdating, isUninstalling]);

  // Mock data for demonstration
  useEffect(() => {
    setInstalledExtensions([
      {
        id: '1',
        name: 'Sample Extension 1',
        version: '1.0.0',
        description: 'Sample extension description',
        author: 'Sample Author',
        isInstalled: true,
        updateStatus: 'up_to_date',
        lastUpdated: '2023-01-01',
        hasUpdate: false
      },
      {
        id: '2',
        name: 'Sample Extension 2',
        version: '1.0.0',
        description: 'Another sample extension',
        author: 'Sample Author',
        isInstalled: true,
        updateStatus: 'has_update',
        lastUpdated: '2023-01-01',
        hasUpdate: true
      }
    ]);
    
    setDiscoverExtensions([
      {
        id: '3',
        name: 'Discover Extension 1',
        version: '1.0.0',
        description: 'Discover extension description',
        author: 'Discover Author',
        isInstalled: false,
        updateStatus: 'up_to_date',
        lastUpdated: '2023-01-01',
        hasUpdate: false
      },
      {
        id: '4',
        name: 'Discover Extension 2',
        version: '1.0.0',
        description: 'Another discover extension',
        author: 'Discover Author',
        isInstalled: false,
        updateStatus: 'up_to_date',
        lastUpdated: '2023-01-01',
        hasUpdate: false
      }
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installed Extensions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Installed Extensions</h2>
          {installedExtensions.length === 0 ? (
            <p className="text-gray-400">No extensions installed</p>
          ) : (
            <div className="space-y-3">
              {installedExtensions.map((extension) => (
                <div key={extension.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{extension.name}</h3>
                      <p className="text-sm text-gray-400">{extension.version} by {extension.author}</p>
                      <p className="text-sm mt-2">{extension.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      {extension.hasUpdate && (
                        <button 
                          onClick={() => updateExtension(extension.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Update
                        </button>
                      )}
                      <button 
                        onClick={() => uninstallExtension(extension.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Uninstall
                      </button>
                    </div>
                  </div>
                  {isUpdating === extension.id && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${updateProgress[extension.id]?.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {updateProgress[extension.id]?.status || 'Updating...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Discover Extensions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Discover Extensions</h2>
          {discoverExtensions.length === 0 ? (
            <p className="text-gray-400">No extensions available</p>
          ) : (
            <div className="space-y-3">
              {discoverExtensions.map((extension) => (
                <div key={extension.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{extension.name}</h3>
                      <p className="text-sm text-gray-400">{extension.version} by {extension.author}</p>
                      <p className="text-sm mt-2">{extension.description}</p>
                    </div>
                    <button 
                      onClick={() => installExtension(extension.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Install
                    </button>
                  </div>
                  {isInstalling === extension.id && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${installProgress[extension.id]?.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {installProgress[extension.id]?.status || 'Installing...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
