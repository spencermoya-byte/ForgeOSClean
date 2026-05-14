import React, { useState, useEffect } from 'react';
import { Star, Download, Package, Calendar, User, Globe, ChevronLeft } from 'lucide-react';
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
}

const MarketplaceDetail: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const [extension, setExtension] = useState<Extension | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [updating, setUpdating] = useState(false);

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
    
    setInstalling(true);
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the installation API
      setExtension({ ...extension, is_installed: true });
    } catch (err) {
      setError('Failed to install extension');
    } finally {
      setInstalling(false);
    }
  };

  const handleUpdate = async () => {
    if (!extension) return;
    
    setUpdating(true);
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call the update API
      setExtension({ ...extension, version: '2.0.0' });
    } catch (err) {
      setError('Failed to update extension');
    } finally {
      setUpdating(false);
    }
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

  return (
    <div className="p-6">
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
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetail;
