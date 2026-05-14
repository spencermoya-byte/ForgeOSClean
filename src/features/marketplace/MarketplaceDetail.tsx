import React, { useState, useEffect } from 'react';
import { Star, Download, Package, Calendar, User, Globe, ChevronLeft, AlertTriangle, Clock, Shield, WifiOff, RotateCcw, Upload } from 'lucide-react';
import { getExtension } from '@/api/marketplace';

interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  author_id: string;
  category: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rating: number;
  downloads: number;
  license: string;
  homepage: string;
  repository: string;
  dependencies: string[];
  compatibility: {
    os: string[];
    architecture: string[];
    forgeos_version: string;
  };
  is_queued?: boolean;
  permissions?: string[];
}

const MarketplaceDetail: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const [extension, setExtension] = useState<Extension | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: string, message: string} | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchExtension = async () => {
      try {
        setLoading(true);
        const data = await getExtension(extensionId);
        setExtension(data);
      } catch (err) {
        setError('Failed to fetch extension details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (extensionId) {
      fetchExtension();
    }
  }, [extensionId]);

  const handleInstall = async () => {
    if (!extension) return;
    
    // Show permissions warning before proceeding
    if (extension.permissions && extension.permissions.length > 0) {
      setShowPermissions(true);
      return;
    }
    
    setInstalling(true);
    setStatusMessage({type: 'success', message: 'Installation started for ' + extension.name});
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the installation API
      setExtension({ ...extension, is_active: true });
    } catch (err) {
      setError('Failed to install extension');
      setStatusMessage({type: 'error', message: 'Failed to install extension. Please try again.'});
    } finally {
      setInstalling(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleUpdate = async () => {
    if (!extension) return;
    
    // Show permissions warning before proceeding
    if (extension.permissions && extension.permissions.length > 0) {
      setShowPermissions(true);
      return;
    }
    
    setUpdating(true);
    setStatusMessage({type: 'success', message: 'Update started for ' + extension.name});
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the update API
      setExtension({ ...extension, version: '2.0.0', is_active: true });
    } catch (err) {
      setError('Failed to update extension');
      setStatusMessage({type: 'error', message: 'Failed to update extension. Please try again.'});
    } finally {
      setUpdating(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmInstall = async () => {
    setShowPermissions(false);
    setInstalling(true);
    setStatusMessage({type: 'success', message: 'Installation started for ' + extension?.name});
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the installation API
      setExtension({ ...extension, is_active: true });
    } catch (err) {
      setError('Failed to install extension');
      setStatusMessage({type: 'error', message: 'Failed to install extension. Please try again.'});
    } finally {
      setInstalling(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmUpdate = async () => {
    setShowPermissions(false);
    setUpdating(true);
    setStatusMessage({type: 'success', message: 'Update started for ' + extension?.name});
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the update API
      setExtension({ ...extension, version: '2.0.0', is_active: true });
    } catch (err) {
      setError('Failed to update extension');
      setStatusMessage({type: 'error', message: 'Failed to update extension. Please try again.'});
    } finally {
      setUpdating(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleRetry = async () => {
    // Simulate retry
    setLoading(true);
    setError(null);
    try {
      const data = await getExtension(extensionId);
      setExtension(data);
    } catch (err) {
      setError('Failed to fetch extension details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    // Simulate import process
    setImportStatus('validating');
    setStatusMessage({type: 'success', message: 'Validating extension package...'});
    
    try {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setImportStatus('importing');
      setStatusMessage({type: 'success', message: 'Importing extension...'});
      
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportStatus('success');
      setStatusMessage({type: 'success', message: 'Extension imported successfully!'});
      
      // Reset status after success
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage(null);
      }, 3000);
      
    } catch (err) {
      setImportStatus('error');
      setStatusMessage({type: 'error', message: 'Failed to import extension. Please try again.'});
      
      // Reset status after error
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage(null);
      }, 5000);
    }
  };

  // Check if extension is compatible with current system
  const isCompatible = () => {
    if (!extension) return true;
    
    // In a real app, this would check against the actual system
    // For now, we'll simulate compatibility checking
    return true;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!extension) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">Extension not found</div>
          <p className="text-gray-500">The extension you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const compatible = isCompatible();

  return (
    <div className="p-6">
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          statusMessage.type === 'success' 
            ? 'bg-green-900 border border-green-700 text-green-200' 
            : 'bg-red-900 border border-red-700 text-red-200'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      {!isOnline && (
        <div className="mb-4 bg-yellow-900 border border-yellow-700 rounded-lg p-4 flex items-start">
          <WifiOff className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-200 font-medium">Offline Mode</h3>
            <p className="text-yellow-300 text-sm mt-1">
              You are currently offline. Some features may be limited.
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center text-yellow-200 hover:text-yellow-100 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Retry Connection
            </button>
          </div>
        </div>
      )}
      
      {showPermissions && extension && (
        <div className="mb-4 bg-yellow-900 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-200 font-medium">Permission Required</h3>
              <p className="text-yellow-300 text-sm mt-1">
                This extension requires the following permissions:
              </p>
              <ul className="mt-2 text-yellow-300 text-sm list-disc pl-5">
                {extension.permissions?.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleConfirmInstall}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Install Anyway
                </button>
                <button
                  onClick={() => {
                    setShowPermissions(false);
                    // Reset the install/update state to prevent confusion
                    if (installing) setInstalling(false);
                    if (updating) setUpdating(false);
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <button className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{extension.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-gray-700 rounded px-2 py-1">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-300">{extension.rating}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Download className="h-4 w-4 mr-1" />
                <span>{extension.downloads.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {extension.is_active ? (
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            ) : (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {installing ? 'Installing...' : 'Install'}
              </button>
            )}
          </div>
        </div>
      </div>

      {importStatus !== 'idle' && (
        <div className="mb-4 bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            {importStatus === 'validating' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-blue-200">Validating extension package...</span>
              </>
            )}
            {importStatus === 'importing' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-blue-200">Importing extension...</span>
              </>
            )}
            {importStatus === 'success' && (
              <>
                <Upload className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-green-200">Extension imported successfully!</span>
              </>
            )}
            {importStatus === 'error' && (
              <>
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-200">Failed to import extension</span>
              </>
            )}
          </div>
        </div>
      )}

      {extension.is_queued && (
        <div className="mb-6 bg-blue-900 border border-blue-700 rounded-lg p-4 flex items-start">
          <Clock className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-200 font-medium">Installation Queued</h3>
            <p className="text-blue-300 text-sm mt-1">
              This extension is queued for installation and will be installed shortly.
            </p>
          </div>
        </div>
      )}

      {!compatible && (
        <div className="mb-6 bg-yellow-900 border border-yellow-700 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-200 font-medium">Compatibility Warning</h3>
            <p className="text-yellow-300 text-sm mt-1">
              This extension may not be fully compatible with your current system.
              Proceed with caution.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
            <p className="text-gray-300">{extension.description}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Compatibility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Operating Systems</h3>
                <p className="text-gray-300">{extension.compatibility.os.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Architecture</h3>
                <p className="text-gray-300">{extension.compatibility.architecture.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">ForgeOS Version</h3>
                <p className="text-gray-300">{extension.compatibility.forgeos_version}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Extension Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-white">{extension.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Author</span>
                <span className="text-white">{extension.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="text-white">{extension.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">License</span>
                <span className="text-white">{extension.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-white">{new Date(extension.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Updated</span>
                <span className="text-white">{new Date(extension.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Links</h2>
            <div className="space-y-2">
              {extension.homepage && (
                <a href={extension.homepage} className="flex items-center text-blue-400 hover:text-blue-300 text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Homepage
                </a>
              )}
              {extension.repository && (
                <a href={extension.repository} className="flex items-center text-blue-400 hover:text-blue-300 text-sm">
                  <Package className="h-4 w-4 mr-2" />
                  Repository
                </a>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h2 className="text-lg font-semibold text-white mb-3">Import Extension</h2>
            <p className="text-gray-300 text-sm mb-3">
              Import an extension package from your local system
            </p>
            <button
              onClick={handleImport}
              disabled={importStatus !== 'idle'}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Extension
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetail;
