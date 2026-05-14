import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  // ... existing code ...

  // Toggle extension active state with optimistic UI and better synchronization
  const toggleExtensionActive = useCallback((extensionId: string) => {
    if (isEnabling === extensionId || isDisabling === extensionId) return;
    
    const extension = installedExtensions.find(ext => ext.id === extensionId);
    if (!extension) return;
    
    if (extension.isActive) {
      setIsDisabling(extensionId);
    } else {
      setIsEnabling(extensionId);
    }
    
    // Optimistically update the UI
    setInstalledExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId ? { 
          ...ext, 
          isActive: !ext.isActive,
          runtimeStatus: !ext.isActive ? ext.runtimeStatus : 'inactive', // Ensure runtime status is updated
          processInfo: !ext.isActive ? ext.processInfo : null // Clear process info when disabling
        } : ext
      )
    );
    
    // Update discover extensions as well
    setDiscoverExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId ? { 
          ...ext, 
          isActive: !ext.isActive,
          runtimeStatus: !ext.isActive ? ext.runtimeStatus : 'inactive',
          processInfo: !ext.isActive ? ext.processInfo : null
        } : ext
      )
    );
    
    // Reset after a short delay
    setTimeout(() => {
      setIsEnabling(null);
      setIsDisabling(null);
    }, 300);
  }, [isEnabling, isDisabling, installedExtensions]);

  // ... rest of existing code ...
  
  return (
    // ... existing JSX ...
  );
};

export default MarketplaceDashboard;
