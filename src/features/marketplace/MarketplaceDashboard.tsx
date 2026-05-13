import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [sortOption, setSortOption] = useState('name');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const navigate = useUseNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Initialize favorites and collections from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('marketplaceFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }

    const savedCollections = localStorage.getItem('marketplaceCollections');
    if (savedCollections) {
      try {
        setCollections(JSON.parse(savedCollections));
      } catch (e) {
        console.error('Failed to parse collections from localStorage', e);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('marketplaceFavorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Save collections to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('marketplaceCollections', JSON.stringify(collections));
    } catch (e) {
      console.error('Failed to save collections to localStorage', e);
    }
  }, [collections]);

  // Toggle favorite status
  const toggleFavorite = (extensionId: string) => {
    setFavorites(prev => {
      if (prev.includes(extensionId)) {
        return prev.filter(id => id !== extensionId);
      } else {
        return [...prev, extensionId];
      }
    });
  };

  // Create a new collection
  const createCollection = () => {
    if (!collectionName.trim()) return;
    
    const newCollection = {
      id: Date.now().toString(),
      name: collectionName.trim(),
      extensions: [],
      createdAt: new Date().toISOString()
    };
    
    setCollections(prev => [...prev, newCollection]);
    setCollectionName('');
    setShowCollectionModal(false);
  };

  // Delete a collection
  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(col => col.id !== id));
  };

  // Start editing a collection
  const startEditingCollection = (collection: any) => {
    setEditingCollectionId(collection.id);
    setEditingCollectionName(collection.name);
  };

  // Save collection name change
  const saveCollectionName = () => {
    if (!editingCollectionId || !editingCollectionName.trim()) return;
    
    setCollections(prev => 
      prev.map(col => 
        col.id === editingCollectionId 
          ? { ...col, name: editingCollectionName.trim() } 
          : col
      )
    );
    
    setEditingCollectionId(null);
    setEditingCollectionName('');
  };

  // Add extension to collection
  const addExtensionToCollection = (collectionId: string, extensionId: string) => {
    setCollections(prev => 
      prev.map(col => 
        col.id === collectionId 
          ? { ...col, extensions: [...col.extensions, extensionId] } 
          : col
      )
    );
  };

  // Remove extension from collection
  const removeExtensionFromCollection = (collectionId: string, extensionId: string) => {
    setCollections(prev => 
      prev.map(col => 
        col.id === collectionId 
          ? { ...col, extensions: col.extensions.filter(id => id !== extensionId) } 
          : col
      )
    );
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
      ],
      updateStatus: 'available',
      updateAvailableVersion: '1.3.0',
      updateAvailableDate: '2023-06-15',
      updateNotes: 'New AI models and performance improvements',
      updateCompatibility: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'Development Tools',
      tags: ['ai', 'code', 'assistant']
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
      ],
      updateStatus: 'up_to_date',
      updateAvailableVersion: '0.9.1',
      updateAvailableDate: '2023-04-22',
      category: 'Development Tools',
      tags: ['git', 'version-control']
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
      ],
      updateStatus: 'requires_review',
      updateAvailableVersion: '2.2.0',
      updateAvailableDate: '2023-06-10',
      updateNotes: 'Breaking changes in API, requires manual review',
      updateCompatibility: {
        forgeosVersion: '>=3.0.0',
        nodeVersion: '>=16.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'Database Tools',
      tags: ['database', 'sql', 'explorer']
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
    },
    updateStatus: 'available',
    updateAvailableVersion: '1.3.0',
    updateAvailableDate: '2023-06-15',
    updateNotes: 'New AI models and performance improvements',
    updateCompatibility: {
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
      },
      updateStatus: 'available',
      updateAvailableVersion: '1.3.0',
      category: 'Development Tools',
      tags: ['ai', 'code', 'assistant']
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
      },
      category: 'Development Tools',
      tags: ['git', 'version-control']
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
      },
      updateStatus: 'requires_review',
      updateAvailableVersion: '2.2.0',
      category: 'Database Tools',
      tags: ['database', 'sql', 'explorer']
    },
    {
      id: '4',
      name: 'Theme Switcher',
      version: '1.0.2',
      description: 'Customizable UI themes for ForgeOS',
      author: 'ForgeOS Team',
      rating: 4.2,
      downloads: 3400,
      category: 'UI Tools',
      tags: ['theme', 'ui', 'customization'],
      isInstalled: false,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'UI Tools',
      tags: ['theme', 'ui', 'customization']
    },
    {
      id: '5',
      name: 'File Explorer',
      version: '0.8.5',
      description: 'Enhanced file browsing and management',
      author: 'ForgeOS Team',
      rating: 4.6,
      downloads: 9200,
      category: 'File Management',
      tags: ['file', 'explorer', 'manager'],
      isInstalled: true,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'File Management',
      tags: ['file', 'explorer', 'manager']
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
      case 'available':
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        break;
      case 'up_to_date':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'checking':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'requires_review':
        bgColor = 'bg-orange-600';
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

  // Update status badge component
  const UpdateStatusBadge = ({ status }: { status: string }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-300';
    
    switch (status) {
      case 'available':
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        break;
      case 'up_to_date':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'checking':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'error':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'requires_review':
        bgColor = 'bg-orange-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-300';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Favorite button component
  const FavoriteButton = ({ extensionId }: { extensionId: string }) => {
    const isFavorite = favorites.includes(extensionId);
    
    return (
      <button
        onClick={() => toggleFavorite(extensionId)}
        className={`p-1 rounded-full ${isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </button>
    );
  };

  // Filter chips component
  const FilterChip = ({ filter, value, onRemove }: { filter: string; value: string; onRemove: () => void }) => {
    return (
      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
        {filter}: {value}
        <button 
          onClick={onRemove}
          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </span>
    );
  };

  // Apply filters and search
  const filteredExtensions = discoverExtensions.filter(extension => {
    // Apply search filter
    const matchesSearch = 
      extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      extension.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply category filter
    const matchesCategory = 
      !selectedFilters.category || 
      selectedFilters.category === extension.category;

    // Apply compatibility filter
    const matchesCompatibility = 
      !selectedFilters.compatibility || 
      selectedFilters.compatibility === extension.compatibility;

    // Apply installed filter
    const matchesInstalled = 
      !selectedFilters.installed || 
      (selectedFilters.installed === 'installed' && extension.isInstalled) ||
      (selectedFilters.installed === 'not-installed' && !extension.isInstalled);

    // Apply update filter
    const matchesUpdate = 
      !selectedFilters.update || 
      (selectedFilters.update === 'update-available' && extension.updateStatus === 'available') ||
      (selectedFilters.update === 'up-to-date' && extension.updateStatus === 'up_to_date');

    // Apply favorite filter
    const matchesFavorite = 
      !selectedFilters.favorite || 
      (selectedFilters.favorite === 'favorites' && favorites.includes(extension.id));

    return matchesSearch && matchesCategory && matchesCompatibility && matchesInstalled && matchesUpdate && matchesFavorite;
  });

  // Apply sorting
  const sortedExtensions = [...filteredExtensions].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'compatibility':
        // In a real implementation, we'd sort by actual compatibility status
        return 0;
      default:
        return 0;
    }
  });

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (value === '') {
      // Remove filter if empty value
      const newFilters = { ...selectedFilters };
      delete newFilters[filterType];
      setSelectedFilters(newFilters);
      
      // Remove from active filters
      setActiveFilters(prev => prev.filter(f => f !== `${filterType}:${value}`));
    } else {
      // Add filter
      setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
      
      // Add to active filters
      setActiveFilters(prev => [...prev, `${filterType}:${value}`]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
    setActiveFilters([]);
    setSearchQuery('');
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(discoverExtensions.map(ext => ext.category)));

  // Get unique tags for filter dropdown
  const allTags = Array.from(new Set(discoverExtensions.flatMap(ext => ext.tags)));

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
                      onClick={() => handleTabChange('favorites')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'favorites' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Favorites
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('collections')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'collections' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Collections
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
                {activeTab === 'favorites' && 'Favorite Extensions'}
                {activeTab === 'collections' && 'My Collections'}
                {activeTab === 'details' && 'Extension Details'}
              </h2>

              {/* Search and Filters Section */}
              {activeTab === 'discover' && (
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search extensions by name, description, author, category, or tags..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        />
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Sort Dropdown */}
                    <div className="w-full md:w-auto">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="newest">Sort by Newest</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="downloads">Sort by Downloads</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Active Filters */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm text-gray-400">Active filters:</span>
                      {activeFilters.map((filter, index) => {
                        const [filterType, filterValue] = filter.split(':');
                        return (
                          <FilterChip 
                            key={index} 
                            filter={filterType} 
                            value={filterValue} 
                            onRemove={() => handleFilterChange(filterType, '')} 
                          />
                        );
                      })}
                      <button 
                        onClick={clearAllFilters}
                        className="text-sm text-gray-400 hover:text-white flex items-center"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                  
                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                      <select
                        value={selectedFilters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Compatibility</label>
                      <select
                        value={selectedFilters.compatibility || ''}
                        onChange={(e) => handleFilterChange('compatibility', e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Compatibility</option>
                        <option value="Compatible">Compatible</option>
                        <option value="Incompatible">Incompatible</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Installed</label>
                      <select
                        value={selectedFilters.installed || ''}
                        onChange={(e) => handleFilterChange('installed', e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Extensions</option>
                        <option value="installed">Installed</option>
                        <option value="not-installed">Not Installed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Update Status</label>
                      <select
                        value={selectedFilters.update || ''}
                        onChange={(e) => handleFilterChange('update', e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Updates</option>
                        <option value="update-available">Update Available</option>
                        <option value="up-to-date">Up to Date</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Favorites</label>
                      <select
                        value={selectedFilters.favorite || ''}
                        onChange={(e) => handleFilterChange('favorite', e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Extensions</option>
                        <option value="favorites">Favorites Only</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Results Count */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">
                      {sortedExtensions.length} extension{sortedExtensions.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Favorite Extensions</h3>
                    <p className="text-gray-300">Extensions you've marked as favorites for quick access.</p>
                  </div>
                  
                  {favorites.length === 0 ? (
                    <div className="bg-gray-700 rounded-lg p-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
                      <p className="text-gray-300 mb-4">Click the star icon on any extension to add it to your favorites.</p>
                      <button 
                        onClick={() => handleTabChange('discover')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Discover Extensions
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discoverExtensions
                        .filter(ext => favorites.includes(ext.id))
                        .map((extension) => (
                          <div key={extension.id} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-white">{extension.name}</h3>
                                <p className="text-gray-300 text-sm">v{extension.version}</p>
                              </div>
                              <div className="flex space-x-2">
                                <FavoriteButton extensionId={extension.id} />
                                {extension.isInstalled && (
                                  <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                    Installed
                                  </span>
                                )}
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
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {extension.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
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
                  )}
                </div>
              )}

              {/* Collections Tab */}
              {activeTab === 'collections' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">My Collections</h3>
                        <p className="text-gray-300">Organize your extensions into custom collections.</p>
                      </div>
                      <button 
                        onClick={() => setShowCollectionModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Create Collection
                      </button>
                    </div>
                  </div>
                  
                  {collections.length === 0 ? (
                    <div className="bg-gray-700 rounded-lg p-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
                      <p className="text-gray-300 mb-4">Create collections to organize your favorite extensions.</p>
                      <button 
                        onClick={() => setShowCollectionModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Create Your First Collection
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collections.map((collection) => (
                        <div key={collection.id} className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              {editingCollectionId === collection.id ? (
                                <input
                                  type="text"
                                  value={editingCollectionName}
                                  onChange={(e) => setEditingCollectionName(e.target.value)}
                                  className="bg-gray-600 text-white p-1 rounded w-full mb-2"
                                  autoFocus
                                  onBlur={saveCollectionName}
                                  onKeyDown={(e) => e.key === 'Enter' && saveCollectionName()}
                                />
                              ) : (
                                <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {editingCollectionId === collection.id ? (
                                <button 
                                  onClick={saveCollectionName}
                                  className="text-green-400 hover:text-green-300"
                                  aria-label="Save collection name"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => startEditingCollection(collection)}
                                  className="text-gray-400 hover:text-white"
                                  aria-label="Edit collection name"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                              )}
                              <button 
                                onClick={() => deleteCollection(collection.id)}
                                className="text-red-400 hover:text-red-300"
                                aria-label="Delete collection"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-300 text-sm">
                              {collection.extensions.length} extension{collection.extensions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => handleTabChange('discover')}
                              className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200"
                            >
                              View Extensions
                            </button>
                            <div className="flex space-x-2">
                              <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200">
                                Add Extension
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder content for each tab */}
              {activeTab === 'discover' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Discover New Extensions</h3>
                    <p className="text-gray-300">Browse and install extensions to enhance your ForgeOS experience.</p>
                  </div>
                  
                  {sortedExtensions.length === 0 ? (
                    <div className="bg-gray-700 rounded-lg p-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">No Extensions Found</h3>
                      <p className="text-gray-300 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                      <button 
                        onClick={clearAllFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedExtensions.map((extension) => (
                        <div key={extension.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">{extension.name}</h3>
                              <p className="text-gray-300 text-sm">v{extension.version}</p>
                            </div>
                            <div className="flex space-x-2">
                              <FavoriteButton extensionId={extension.id} />
                              {extension.isInstalled && (
                                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                  Installed
                                </span>
                              )}
                            </div>
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
                              {extension.updateStatus === 'available' && (
                                <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                  Update Available
                                </span>
                              )}
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
                  )}
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
                              <UpdateStatusBadge status={extension.updateStatus} />
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
                                <FavoriteButton extensionId={extensionDetails.id} />
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
                    
                    {/* Update Status */}
                    <div className="p-6 border-b border-gray-600">
                      <h3 className="text-xl font-semibold mb-4">Update Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Current Version</h4>
                          <p className="text-white">v{extensionDetails.version}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">Update Status</h4>
                          <UpdateStatusBadge status={extensionDetails.updateStatus} />
                        </div>
                        {extensionDetails.updateStatus === 'available' && (
                          <>
                            <div>
                              <h4 className="font-medium text-gray-300 mb-2">Available Version</h4>
                              <p className="text-white">v{extensionDetails.updateAvailableVersion}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-300 mb-2">Release Date</h4>
                              <p className="text-white">{extensionDetails.updateAvailableDate}</p>
                            </div>
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-gray-300 mb-2">Update Notes</h4>
                              <p className="text-gray-300">{extensionDetails.updateNotes}</p>
                            </div>
                          </>
                        )}
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

      {/* Create Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Collection</h3>
            <div className="mb-4">
              <label className="block text-white mb-2">Collection Name</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceDashboard;
