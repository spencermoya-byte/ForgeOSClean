import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Star, Download, X, Clock, WifiOff, RotateCcw } from 'lucide-react';
import { getExtensions } from '@/api/marketplace';

interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  isQueued?: boolean;
}

const MarketplaceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{type: string, message: string} | null>(null);
  const [isOnline, setIsOnline] = useState(true);

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
    const fetchExtensions = async () => {
      // Only fetch if there's actually a search term
      if (searchTerm.trim() === '') {
        setExtensions([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getExtensions(searchTerm, categoryFilter);
        setExtensions(data);
      } catch (err) {
        setError('Failed to fetch extensions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent excessive API calls
    const debounceTimer = setTimeout(fetchExtensions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setExtensions([]);
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setSearchTerm('');
    setExtensions([]);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleRetry = async () => {
    // Simulate retry
    setLoading(true);
    setError(null);
    try {
      const data = await getExtensions(searchTerm, categoryFilter);
      setExtensions(data);
    } catch (err) {
      setError('Failed to fetch extensions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = (extensionId: string) => {
    // Simulate installation
    setStatusMessage({type: 'success', message: 'Installation started for extension'});
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdate = (extensionId: string) => {
    // Simulate update
    setStatusMessage({type: 'success', message: 'Update started for extension'});
    setTimeout(() => setStatusMessage(null), 3000);
  };

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
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Marketplace</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search extensions..."
              className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search extensions"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                categoryFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleCategoryChange('development')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                categoryFilter === 'development' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Development
            </button>
            <button
              onClick={() => handleCategoryChange('design')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                categoryFilter === 'design' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Design
            </button>
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-1"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
          {error}
        </div>
      ) : extensions.length === 0 && searchTerm ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No extensions found</div>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : extensions.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No extensions available</h3>
          <p className="text-gray-400">Search for extensions to install</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extensions.map((extension) => (
            <div key={extension.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{extension.name}</h3>
                <div className="flex items-center bg-gray-700 rounded px-2 py-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-300">{extension.rating}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{extension.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">v{extension.version}</span>
                <span className="text-xs text-gray-500">{extension.author}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  <Download className="h-3 w-3 inline mr-1" />
                  {extension.downloads.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  {extension.isQueued && (
                    <span className="flex items-center text-xs text-blue-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Queued
                    </span>
                  )}
                  <button 
                    onClick={() => extension.isInstalled ? handleUpdate(extension.id) : handleInstall(extension.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                  >
                    {extension.isInstalled ? 'Update' : 'Install'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceList;
