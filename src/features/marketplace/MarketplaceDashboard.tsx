import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  // ... existing code ...

  // Install extension with proper state management and duplicate action prevention
  const installExtension = useCallback((extensionId: string) => {
    // Prevent duplicate install actions
    if (isInstalling === extensionId || isUpdating === extensionId || isUninstalling === extensionId) return;
    
    // Show permission modal for new installations
    const extension = discoverExtensions.find(ext => ext.id === extensionId);
    if (extension) {
      setPermissionExtensionId(extensionId);
      setPermissionExtensionName(extension.name);
      setPermissionExtensionPermissions(extension.permissions || []);
      setPermissionExtensionSafety({
        level: extension.safetyLevel,
        warnings: extension.safetyWarnings || []
      });
      setShowPermissionModal(true);
    }
    
    setIsInstalling(extensionId);
  }, [isInstalling, isUpdating, isUninstalling, discoverExtensions]);

  // Confirm installation after showing permissions with proper cleanup
  const confirmInstallation = () => {
    if (permissionExtensionId) {
      // Simulate installation with better synchronization
      setTimeout(() => {
        // Update installed extensions
        setInstalledExtensions(prev => 
          prev.map(ext => 
            ext.id === permissionExtensionId ? { ...ext, isInstalled: true, isActive: true } : ext
          )
        );
        
        // Update discover extensions
        setDiscoverExtensions(prev => 
          prev.map(ext => 
            ext.id === permissionExtensionId ? { ...ext, isInstalled: true } : ext
          )
        );
        
        setShowPermissionModal(false);
        setPermissionExtensionId(null);
        setPermissionExtensionName(null);
        setPermissionExtensionPermissions([]);
        setPermissionExtensionSafety(null);
        setIsInstalling(null);
      }, 1500);
    }
  };

  // Cancel installation with proper cleanup
  const cancelInstallation = () => {
    setShowPermissionModal(false);
    setPermissionExtensionId(null);
    setPermissionExtensionName(null);
    setPermissionExtensionPermissions([]);
    setPermissionExtensionSafety(null);
    setIsInstalling(null);
  };

  // ... rest of existing code ...
  
  // Extension card component with improved install button state handling
  const ExtensionCard = React.memo(({ extension }: { extension: any }) => {
    const isInstalling = isInstalling === extension.id;
    const isUpdating = isUpdating === extension.id;
    const isUninstalling = isUninstalling === extension.id;
    const isTogglingFavorite = isTogglingFavorite === extension.id;
    const isAddingToCollection = isAddingToCollection === `${extension.id}-collection`;
    const isRemovingFromCollection = isRemovingFromCollection === `${extension.id}-collection`;
    const isUpdatingProgress = updateProgress[extension.id];
    const isRollingBack = isRollingBack === extension.id;
    const isRecovering = isRecovering === extension.id;
    
    return (
      <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200">
        {/* ... existing code ... */}
        
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {extension.compatibilityDetails.os.map((os: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                {os}
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            {extension.isInstalled ? (
              <button 
                onClick={() => toggleExtensionActive(extension.id)}
                disabled={isEnabling === extension.id || isDisabling === extension.id}
                className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
                aria-label={extension.isActive ? "Disable extension" : "Enable extension"}
              >
                {isEnabling === extension.id || isDisabling === extension.id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {extension.isActive ? 'Disabling...' : 'Enabling...'}
                  </span>
                ) : extension.isActive ? 'Disable' : 'Enable'}
              </button>
            ) : (
              <button 
                onClick={() => installExtension(extension.id)}
                disabled={isInstalling === extension.id}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
                aria-label="Install extension"
              >
                {isInstalling === extension.id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Installing...
                  </span>
                ) : 'Install'}
              </button>
            )}
          </div>
        </div>
        
        {/* ... rest of existing code ... */}
      </div>
    );
  });

  // ... rest of existing code ...
  
  return (
    // ... existing JSX ...
  );
};

export default MarketplaceDashboard;
