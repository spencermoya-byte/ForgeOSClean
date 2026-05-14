import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  // ... existing code ...
  
  // Import workflow improvements
  const handleImport = () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    // Validate file type
    const validTypes = ['application/zip', 'application/x-zip-compressed', '.forgeos'];
    const isValidType = validTypes.some(type => 
      importFile.type.includes(type) || importFile.name.endsWith(type.replace('.', ''))
    );
    
    if (!isValidType) {
      setImportError('Invalid file type. Please select a .zip or .forgeos file.');
      return;
    }

    // Validate file size (max 50MB)
    if (importFile.size > 50 * 1024 * 1024) {
      setImportError('File too large. Maximum size is 50MB.');
      return;
    }

    setImportStatus('validating');
    setImportError(null);
    
    // Simulate validation with better error handling
    setTimeout(() => {
      // Simulate validation success/failure with more realistic scenarios
      const isValid = Math.random() > 0.15; // 85% success rate for demo
      
      if (isValid) {
        setImportStatus('review');
        setImportReview({
          name: importFile.name,
          size: importFile.size,
          type: importFile.type,
          // Add metadata that would be extracted from the package
          metadata: {
            name: 'New Imported Extension',
            version: '1.0.0',
            author: 'Imported',
            description: 'Imported extension package',
            compatibility: 'Compatible'
          }
        });
      } else {
        setImportStatus('error');
        setImportError('Invalid extension package. Please check the package structure and metadata.');
      }
    }, 1000);
  };

  // Confirm import with proper state management and synchronization
  const confirmImport = () => {
    if (importStatus !== 'review') return;
    
    setImportStatus('importing');
    setImportError(null);
    
    // Simulate import process with better error handling
    setTimeout(() => {
      // Simulate success/failure with more realistic scenarios
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccess) {
        setImportStatus('success');
        // Add to installed extensions with proper synchronization
        const newExtension = {
          id: Date.now().toString(),
          name: importReview?.metadata?.name || 'New Imported Extension',
          version: importReview?.metadata?.version || '1.0.0',
          description: importReview?.metadata?.description || 'Imported extension',
          author: importReview?.metadata?.author || 'Imported',
          isActive: true,
          hasUpdate: false,
          compatibility: importReview?.metadata?.compatibility || 'Compatible',
          capabilities: [],
          lastUpdated: new Date().toISOString().split('T')[0],
          compatibilityDetails: {
            forgeosVersion: '>=2.0.0',
            nodeVersion: '>=14.0.0',
            os: ['Windows', 'macOS', 'Linux']
          },
          dependencies: [],
          updateStatus: 'up_to_date',
          updateAvailableVersion: '1.0.0',
          category: 'Imported',
          tags: ['imported'],
          lastError: null,
          lastErrorTime: null,
          recoveryAvailable: false,
          rollbackAvailable: false,
          lastSuccessfulVersion: null,
          runtimeStatus: 'running',
          processInfo: {
            activeProcesses: 1,
            memoryUsage: '10 MB',
            cpuUsage: '2%',
            lastActivity: new Date().toISOString()
          },
          resourceWarnings: [],
          preflightStatus: {
            permissionsReady: true,
            compatibilityReady: true,
            dependenciesReady: true,
            runtimeSupportReady: true,
            sandboxSupport: 'supported',
            sandboxEnabled: true,
            warnings: []
          }
        };
        
        // Synchronize across all views
        setInstalledExtensions(prev => [...prev, newExtension]);
        setDiscoverExtensions(prev => [...prev, newExtension]);
        
        // Reset after success with better UI feedback
        setTimeout(() => {
          setImportStatus('idle');
          setImportFile(null);
          setImportReview(null);
          setImportError(null);
        }, 2000);
      } else {
        setImportStatus('error');
        setImportError('Failed to import extension. Please check the package integrity.');
      }
    }, 2000);
  };

  // Cancel import with proper cleanup
  const cancelImport = () => {
    setImportStatus('idle');
    setImportFile(null);
    setImportReview(null);
    setImportError(null);
  };

  // Handle export with improved error handling and synchronization
  const handleExport = (extensionId: string) => {
    if (exportExtensionId === extensionId && exportStatus !== 'idle') return;
    
    setExportExtensionId(extensionId);
    setExportStatus('preparing');
    setExportError(null);
    
    // Simulate export preparation with better error handling
    setTimeout(() => {
      setExportStatus('exporting');
      
      // Simulate export completion with better error handling
      setTimeout(() => {
        const isSuccess = Math.random() > 0.1; // 90% success rate for demo
        
        if (isSuccess) {
          setExportStatus('success');
          // Reset after success with better UI feedback
          setTimeout(() => {
            setExportStatus('idle');
            setExportExtensionId(null);
          }, 2000);
        } else {
          setExportStatus('error');
          setExportError('Failed to export extension. Please try again.');
        }
      }, 2000);
    }, 1000);
  };

  // ... rest of existing code ...

  return (
    // ... existing JSX ...
  );
};

export default MarketplaceDashboard;
