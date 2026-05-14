import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  // ... existing code ...

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

  // ... rest of existing code ...
  
  return (
    // ... existing JSX ...
  );
};

export default MarketplaceDashboard;
