import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'review' | 'importing' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [importReview, setImportReview] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportExtensionId, setExportExtensionId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'preparing' | 'exporting' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);
  const [showUninstallModal, setShowUninstallModal] = useState(false);
  const [uninstallExtensionId, setUninstallExtensionId] = useState<string | null>(null);
  const [uninstallExtensionName, setUninstallExtensionName] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryExtensionId, setRecoveryExtensionId] = useState<string | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState<any>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackExtensionId, setRollbackExtensionId] = useState<string | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isUninstalling, setIsUninstalling] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock data for installed extensions
  const [installedExtensions, setInstalledExtensions] = useState<any[]>([
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
      tags: ['ai', 'code', 'assistant'],
      lastError: 'Failed to initialize AI engine component',
      lastErrorTime: '2023-06-10 14:30:00',
      recoveryAvailable: true,
      rollbackAvailable: true,
      lastSuccessfulVersion: '1.2.0',
      runtimeStatus: 'running', // Added runtime status
      processInfo: {
        activeProcesses: 2,
        memoryUsage: '45 MB',
        cpuUsage: '12%',
        lastActivity: '2023-06-15 14:30:00'
      },
      resourceWarnings: [
        'Memory usage is high',
        'CPU usage is moderate'
      ],
      preflightStatus: {
        permissionsReady: true,
        compatibilityReady: true,
        dependenciesReady: true,
        runtimeSupportReady: true,
        sandboxSupport: 'supported',
        sandboxEnabled: true,
        warnings: []
      }
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
      tags: ['git', 'version-control'],
      lastError: null,
      lastErrorTime: null,
      recoveryAvailable: false,
      rollbackAvailable: false,
      lastSuccessfulVersion: null,
      runtimeStatus: 'inactive', // Added runtime status
      processInfo: null,
      resourceWarnings: [],
      preflightStatus: {
        permissionsReady: true,
        compatibilityReady: true,
        dependenciesReady: true,
        runtimeSupportReady: true,
        sandboxSupport: 'supported',
        sandboxEnabled: false,
        warnings: []
      }
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
      tags: ['database', 'sql', 'explorer'],
      lastError: 'Incompatible with current ForgeOS version',
      lastErrorTime: '2023-06-01 09:15:00',
      recoveryAvailable: true,
      rollbackAvailable: true,
      lastSuccessfulVersion: '1.5.0',
      runtimeStatus: 'error', // Added runtime status
      processInfo: {
        activeProcesses: 0,
        memoryUsage: '0 MB',
        cpuUsage: '0%',
        lastActivity: '2023-06-01 09:15:00'
      },
      resourceWarnings: [
        'Extension is incompatible with current ForgeOS version',
        'Missing required dependency: Database Driver v1.0.0'
      ],
      preflightStatus: {
        permissionsReady: false,
        compatibilityReady: false,
        dependenciesReady: false,
        runtimeSupportReady: false,
        sandboxSupport: 'unsupported',
        sandboxEnabled: false,
        warnings: [
          'Extension is incompatible with current ForgeOS version',
          'Missing required dependency: Database Driver v1.0.0'
        ]
      }
    }
  ]);

  // Mock data for extension details
  const [extensionDetails, setExtensionDetails] = useState<any>({
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
    },
    lastError: 'Failed to initialize AI engine component',
    lastErrorTime: '2023-06-10 14:30:00',
    recoveryAvailable: true,
    rollbackAvailable: true,
    lastSuccessfulVersion: '1.2.0',
    runtimeStatus: 'running',
    processInfo: {
      activeProcesses: 2,
      memoryUsage: '45 MB',
      cpuUsage: '12%',
      lastActivity: '2023-06-15 14:30:00'
    },
    resourceWarnings: [
      'Memory usage is high',
      'CPU usage is moderate'
    ],
    preflightStatus: {
      permissionsReady: true,
      compatibilityReady: true,
      dependenciesReady: true,
      runtimeSupportReady: true,
      sandboxSupport: 'supported',
      sandboxEnabled: true,
      warnings: []
    }
  });

  // Mock data for discover extensions
  const [discoverExtensions, setDiscoverExtensions] = useState<any[]>([
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
      rating: 4.2,
      downloads: 5200,
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
      name: 'Theme Editor',
      version: '1.0.5',
      description: 'Customize your ForgeOS theme',
      author: 'ForgeOS Team',
      rating: 4.0,
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
      updateStatus: 'up_to_date',
      updateAvailableVersion: '1.0.5',
      category: 'UI Tools',
      tags: ['theme', 'ui', 'customization']
    }
  ]);

  // Mock data for marketplace status
  const [marketplaceStatus, setMarketplaceStatus] = useState<any>({
    extensions: {},
    capabilities: {},
    assets: {},
    installed_extensions: ['1', '2', '3'],
    active_extensions: ['1', '3'],
    marketplace_config: {
      is_enabled: true,
      auto_update: true,
      update_check_interval: 24,
      max_download_threads: 5,
      cache_enabled: true,
      cache_size_limit: 1024,
      trusted_sources: ['forgeos'],
      security_level: 'Medium',
      default_category: 'general'
    },
    ecosystem_health: {
      total_extensions: 100,
      active_extensions: 75,
      total_assets: 50,
      verified_extensions: 85,
      security_score: 92.5,
      performance_score: 88.0,
      last_updated: '2023-06-15T10:00:00Z',
      health_status: 'Healthy'
    },
    extension_configurations: {},
    last_sync: '2023-06-15T10:00:00Z',
    sync_status: 'Synced'
  });

  // Initialize from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('marketplaceFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    const savedCollections = localStorage.getItem('marketplaceCollections');
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
  }, []);

  // Save to localStorage when favorites or collections change
  useEffect(() => {
    localStorage.setItem('marketplaceFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('marketplaceCollections', JSON.stringify(collections));
  }, [collections]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, this would fetch fresh data from the backend
    }, 500);
  }, []);

  // Toggle favorite
  const toggleFavorite = (extensionId: string) => {
    setFavorites(prev => {
      if (prev.includes(extensionId)) {
        return prev.filter(id => id !== extensionId);
      } else {
        return [...prev, extensionId];
      }
    });
  };

  // Create collection
  const createCollection = () => {
    if (collectionName.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: collectionName.trim(),
        extensions: [],
        createdAt: new Date().toISOString()
      };
      setCollections(prev => [...prev, newCollection]);
      setCollectionName('');
      setShowCollectionModal(false);
    }
  };

  // Update collection name
  const updateCollectionName = () => {
    if (editingCollectionName.trim() && editingCollectionId) {
      setCollections(prev => 
        prev.map(col => 
          col.id === editingCollectionId 
            ? { ...col, name: editingCollectionName.trim() } 
            : col
        )
      );
      setEditingCollectionId(null);
      setEditingCollectionName('');
    }
  };

  // Delete collection
  const deleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(col => col.id !== collectionId));
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

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  // Handle import
  const handleImport = () => {
    if (importFile) {
      setImportStatus('validating');
      // Simulate validation
      setTimeout(() => {
        setImportStatus('review');
        setImportReview({
          name: importFile.name,
          size: importFile.size,
          type: importFile.type
        });
      }, 1000);
    }
  };

  // Confirm import
  const confirmImport = () => {
    setImportStatus('importing');
    // Simulate import process
    setTimeout(() => {
      setImportStatus('success');
      // Reset after success
      setTimeout(() => {
        setImportStatus('idle');
        setImportFile(null);
        setImportReview(null);
      }, 2000);
    }, 2000);
  };

  // Cancel import
  const cancelImport = () => {
    setImportStatus('idle');
    setImportFile(null);
    setImportReview(null);
  };

  // Handle export
  const handleExport = (extensionId: string) => {
    setExportExtensionId(extensionId);
    setExportStatus('preparing');
    // Simulate export preparation
    setTimeout(() => {
      setExportStatus('exporting');
      // Simulate export completion
      setTimeout(() => {
        setExportStatus('success');
        // Reset after success
        setTimeout(() => {
          setExportStatus('idle');
          setExportExtensionId(null);
        }, 2000);
      }, 2000);
    }, 1000);
  };

  // Install extension
  const installExtension = (extensionId: string) => {
    setIsInstalling(extensionId);
    // Simulate installation
    setTimeout(() => {
      // Update installed extensions
      setInstalledExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, isInstalled: true, isActive: true } : ext
        )
      );
      
      // Update discover extensions
      setDiscoverExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, isInstalled: true } : ext
        )
      );
      
      setIsInstalling(null);
    }, 1500);
  };

  // Update extension
  const updateExtension = (extensionId: string) => {
    setIsUpdating(extensionId);
    // Simulate update
    setTimeout(() => {
      // Update extension version
      setInstalledExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, version: '1.3.0', updateStatus: 'up_to_date' } : ext
        )
      );
      
      setDiscoverExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, version: '1.3.0', updateStatus: 'up_to_date' } : ext
        )
      );
      
      setIsUpdating(null);
    }, 1500);
  };

  // Uninstall extension
  const uninstallExtension = (extensionId: string) => {
    setIsUninstalling(extensionId);
    // Simulate uninstallation
    setTimeout(() => {
      // Update installed extensions
      setInstalledExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, isInstalled: false, isActive: false } : ext
        )
      );
      
      // Update discover extensions
      setDiscoverExtensions(prev => 
        prev.map(ext => 
          ext.id === extensionId ? { ...ext, isInstalled: false } : ext
        )
      );
      
      setIsUninstalling(null);
      setShowUninstallModal(false);
    }, 1500);
  };

  // Toggle extension active state
  const toggleExtensionActive = (extensionId: string) => {
    setInstalledExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId ? { ...ext, isActive: !ext.isActive } : ext
      )
    );
  };

  // Filter and sort extensions
  const filteredAndSortedExtensions = useCallback(() => {
    let filtered = [...discoverExtensions];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ext => 
        ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedFilters.category) {
      filtered = filtered.filter(ext => ext.category === selectedFilters.category);
    }
    
    // Apply tags filter
    if (selectedFilters.tags && selectedFilters.tags.length > 0) {
      filtered = filtered.filter(ext => 
        selectedFilters.tags.every(tag => ext.tags.includes(tag))
      );
    }
    
    // Apply compatibility filter
    if (selectedFilters.compatibility) {
      filtered = filtered.filter(ext => ext.compatibility === selectedFilters.compatibility);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
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
          return a.compatibility.localeCompare(b.compatibility);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [discoverExtensions, searchQuery, selectedFilters, sortOption]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
  };

  // Get active filters
  const getActiveFilters = () => {
    const activeFilters = [];
    if (searchQuery) activeFilters.push(`Search: ${searchQuery}`);
    if (selectedFilters.category) activeFilters.push(`Category: ${selectedFilters.category}`);
    if (selectedFilters.tags && selectedFilters.tags.length > 0) activeFilters.push(`Tags: ${selectedFilters.tags.join(', ')}`);
    if (selectedFilters.compatibility) activeFilters.push(`Compatibility: ${selectedFilters.compatibility}`);
    return activeFilters;
  };

  // Status badge component
  const StatusBadge = ({ status, className = '' }: { status: string; className?: string }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-200';
    
    switch (status.toLowerCase()) {
      case 'compatible':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'incompatible':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'available':
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        break;
      case 'up_to_date':
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-200';
        break;
      case 'requires_review':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-200';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs ${className}`}>
        {status}
      </span>
    );
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-600 rounded w-5/6 mb-4"></div>
      <div className="h-8 bg-gray-600 rounded w-1/4"></div>
    </div>
  );

  // Extension card component
  const ExtensionCard = ({ extension }: { extension: any }) => (
    <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{extension.name}</h3>
          <p className="text-gray-300 text-sm">v{extension.version}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => toggleFavorite(extension.id)}
            className="text-gray-400 hover:text-yellow-400 transition duration-200"
            aria-label={favorites.includes(extension.id) ? "Remove from favorites" : "Add to favorites"}
          >
            {favorites.includes(extension.id) ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
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
        {extension.tags.map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <StatusBadge status={extension.compatibility} />
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
              className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200"
              aria-label={extension.isActive ? "Disable extension" : "Enable extension"}
            >
              {extension.isActive ? 'Disable' : 'Enable'}
            </button>
          ) : (
            <button 
              onClick={() => installExtension(extension.id)}
              disabled={isInstalling === extension.id}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
              aria-label="Install extension"
            >
              {isInstalling === extension.id ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Extension detail component
  const ExtensionDetail = ({ extension }: { extension: any }) => (
    <div className="bg-gray-700 rounded-lg overflow-hidden">
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
                <h2 className="text-2xl font-bold">{extension.name}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-gray-300 mr-2">v{extension.version}</span>
                  <button 
                    onClick={() => toggleFavorite(extension.id)}
                    className="text-gray-400 hover:text-yellow-400 transition duration-200"
                    aria-label={favorites.includes(extension.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(extension.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </button>
                  <span className={`px-2 py-1 rounded text-xs ${extension.isInstalled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {extension.isInstalled ? 'Installed' : 'Not Installed'}
                  </span>
                  {extension.isUpdateAvailable && (
                    <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded text-xs ml-2">
                      Update Available
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {extension.isInstalled ? (
                  <button 
                    onClick={() => toggleExtensionActive(extension.id)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-200"
                    aria-label={extension.isActive ? "Disable extension" : "Enable extension"}
                  >
                    {extension.isActive ? 'Disable' : 'Enable'}
                  </button>
                ) : (
                  <button 
                    onClick={() => installExtension(extension.id)}
                    disabled={isInstalling === extension.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                    aria-label="Install extension"
                  >
                    {isInstalling === extension.id ? 'Installing...' : 'Install'}
                  </button>
                )}
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-200" aria-label="View extension details">
                  Details
                </button>
              </div>
            </div>
            
            <p className="mt-4 text-gray-300">{extension.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                {extension.category}
              </span>
              {extension.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-gray-300">{extension.rating}</span>
              </div>
              <span className="text-gray-400 mr-4">{extension.downloads.toLocaleString()} downloads</span>
              <span className="text-gray-400">{extension.license}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-b border-gray-600">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Publisher</h4>
            <div className="flex items-center">
              <div className="bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <span className="text-sm">F</span>
              </div>
              <span className="text-white">{extension.author}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Compatibility</h4>
            <div className="flex items-center">
              <StatusBadge status={extension.compatibility} />
              <span className="text-gray-300 ml-2">{extension.compatibility}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Installation Date</h4>
            <p className="text-white">{extension.installedAt}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Last Updated</h4>
            <p className="text-white">{extension.lastUpdated}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-b border-gray-600">
        <h3 className="text-xl font-semibold mb-4">Capabilities & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {extension.capabilities.map((capability: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                  {capability}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Required Permissions</h4>
            <div className="space-y-2">
              {extension.permissions.map((permission: any, index: number) => (
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
      
      <div className="p-6 border-b border-gray-600">
        <h3 className="text-xl font-semibold mb-4">Compatibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Operating Systems</h4>
            <div className="flex flex-wrap gap-2">
              {extension.compatibilityDetails.os.map((os: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                  {os}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">System Requirements</h4>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>ForgeOS version: {extension.compatibilityDetails.forgeosVersion}</li>
              <li>Node.js version: {extension.compatibilityDetails.nodeVersion}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Version History</h3>
        <div className="space-y-3">
          {extension.versionHistory.map((version: any, index: number) => (
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
  );

  // Render the dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ForgeOS Marketplace</h1>
          <div className="flex space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
              aria-label="Refresh marketplace"
            >
              {isRefreshing ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-200"
              aria-label="Import extension"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'discover' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'installed' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Installed
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'updates' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Updates
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'details' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'import-export' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Import/Export
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-4 py-2 rounded-md transition duration-200 ${
              activeTab === 'recovery' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Recovery
          </button>
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Discover New Extensions</h3>
              <p className="text-gray-300">Browse and install extensions to enhance your ForgeOS experience.</p>
            </div>
            
            {/* Filters Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2" htmlFor="search-input">Search Extensions</label>
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name, description, author..."
                    aria-label="Search extensions"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2" htmlFor="category-select">Category</label>
                  <select
                    id="category-select"
                    value={selectedFilters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    <option value="Development Tools">Development Tools</option>
                    <option value="Database Tools">Database Tools</option>
                    <option value="UI Tools">UI Tools</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2" htmlFor="sort-select">Sort By</label>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Sort extensions"
                  >
                    <option value="name">Name</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Rating</option>
                    <option value="downloads">Downloads</option>
                    <option value="compatibility">Compatibility</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filters */}
              {getActiveFilters().length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-300">Active Filters</h4>
                    <button 
                      onClick={clearAllFilters}
                      className="text-sm text-gray-400 hover:text-white"
                      aria-label="Clear all filters"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getActiveFilters().map((filter, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Extensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedExtensions().map((extension) => (
                <ExtensionCard key={extension.id} extension={extension} />
              ))}
            </div>
          </div>
        )}

        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Installed Extensions</h3>
              <p className="text-gray-300">Manage your installed extensions and their settings.</p>
            </div>
            
            {installedExtensions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Extensions Installed</h3>
                <p className="text-gray-300 mb-4">Install extensions from the Discover tab to get started.</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  aria-label="Discover extensions"
                >
                  Discover Extensions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installedExtensions.map((extension) => (
                  <div key={extension.id} className="bg-gray-800 p-4 rounded-lg">
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
                        <StatusBadge status={extension.compatibility} />
                        <span className="ml-2 text-sm text-gray-400">
                          {extension.updateStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {extension.capabilities.map((capability: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs">
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
                        {extension.compatibilityDetails.os.map((os: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs">
                            {os}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        Installed: {extension.lastUpdated}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleExtensionActive(extension.id)}
                          disabled={isInstalling === extension.id || isUpdating === extension.id || isUninstalling === extension.id}
                          className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
                          aria-label={extension.isActive ? "Disable extension" : "Enable extension"}
                        >
                          {extension.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => updateExtension(extension.id)}
                          disabled={isInstalling === extension.id || isUpdating === extension.id || isUninstalling === extension.id}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
                          aria-label="Update extension"
                        >
                          {isUpdating === extension.id ? 'Updating...' : 'Update'}
                        </button>
                        <button 
                          onClick={() => {
                            setUninstallExtensionId(extension.id);
                            setUninstallExtensionName(extension.name);
                            setShowUninstallModal(true);
                          }}
                          disabled={isInstalling === extension.id || isUpdating === extension.id || isUninstalling === extension.id}
                          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-200 disabled:opacity-50"
                          aria-label="Uninstall extension"
                        >
                          {isUninstalling === extension.id ? 'Uninstalling...' : 'Uninstall'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Extension Details</h3>
              <p className="text-gray-300">View detailed information about this extension.</p>
            </div>
            
            <ExtensionDetail extension={extensionDetails} />
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Local Extension Import/Export</h3>
              <p className="text-gray-300">Manage extensions using local files without external communication.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Import Card */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Import Extension</h3>
                <p className="text-gray-300 mb-4">
                  Import extensions from local files. All imports are processed locally and never uploaded to any server.
                </p>
                
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition duration-200 mb-4"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Select extension file to import"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-gray-300">Click to select or drag & drop a .zip or .forgeos file</p>
                  <p className="text-sm text-gray-500 mt-1">Local-only import - no external communication</p>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".zip,.forgeos"
                  className="hidden"
                  aria-label="Select extension file to import"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  aria-label="Select extension file to import"
                >
                  Select Extension File
                </button>
              </div>
              
              {/* Export Card */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Export Extension</h3>
                <p className="text-gray-300 mb-4">
                  Export installed extensions to local files for sharing or backup.
                </p>
                
                <div className="space-y-3">
                  {installedExtensions.slice(0, 3).map((extension) => (
                    <div key={extension.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{extension.name}</h4>
                          <p className="text-sm text-gray-300">v{extension.version}</p>
                        </div>
                        <button
                          onClick={() => handleExport(extension.id)}
                          disabled={exportExtensionId === extension.id && exportStatus === 'exporting'}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50"
                          aria-label={`Export ${extension.name} extension`}
                        >
                          {exportExtensionId === extension.id && exportStatus === 'exporting' ? 'Exporting...' : 'Export'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Tab */}
        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Extension Recovery</h3>
              <p className="text-gray-300">Manage problematic extensions and restore functionality.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recovery Actions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Safe Mode</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Enable safe mode to prevent problematic extensions from running
                    </p>
                    <button className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition duration-200" aria-label="Enable safe mode">
                      Enable Safe Mode
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Extension Diagnostics</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Run diagnostics to identify extension issues
                    </p>
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200" aria-label="Run diagnostics">
                      Run Diagnostics
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">System Restore</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Restore system to a previous state before extension issues
                    </p>
                    <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition duration-200" aria-label="Restore system">
                      Restore System
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Problematic Extensions</h3>
                <div className="space-y-4">
                  {installedExtensions.filter(ext => ext.lastError).map((extension) => (
                    <div key={extension.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{extension.name}</h4>
                        <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                          Error
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{extension.lastError}</p>
                      <p className="text-gray-400 text-xs mb-3">Error occurred: {extension.lastErrorTime}</p>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200" aria-label="View recovery options">
                          Recovery Options
                        </button>
                        <button className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200" aria-label="Disable extension">
                          Disable
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Available Updates</h3>
              <p className="text-gray-300">Update your installed extensions to the latest versions.</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-700 rounded w-1/3" aria-hidden="true"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6" aria-hidden="true"></div>
              </div>
              <div className="h-3 bg-gray-700 rounded w-full mb-2" aria-hidden="true"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6 mb-4" aria-hidden="true"></div>
              <div className="h-8 bg-gray-700 rounded w-1/4" aria-hidden="true"></div>
            </div>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="collection-modal-title">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 id="collection-modal-title" className="text-xl font-bold text-white mb-4">Create New Collection</h3>
            <div className="mb-4">
              <label className="block text-white mb-2" htmlFor="collection-name">Collection Name</label>
              <input
                id="collection-name"
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection name"
                aria-label="Enter collection name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
                aria-label="Cancel creating collection"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                aria-label="Create collection"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall Confirmation Modal */}
      {showUninstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="uninstall-modal-title">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 id="uninstall-modal-title" className="text-xl font-bold text-white mb-4">Uninstall Extension</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to uninstall <span className="font-semibold">{uninstallExtensionName}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-white mb-2">Important Notice</h4>
              <p className="text-gray-300 text-sm">
                This extension will be completely removed from your system. 
                Any configuration or data associated with this extension will be lost.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUninstallModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
                aria-label="Cancel uninstall"
              >
                Cancel
              </button>
              <button
                onClick={() => uninstallExtension(uninstallExtensionId!)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                aria-label="Confirm uninstall"
              >
                Uninstall Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 id="import-modal-title" className="text-xl font-bold text-white mb-4">Import Extension</h3>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Select an extension file to import:</p>
              <input
                type="file"
                accept=".zip,.forgeos"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select extension file to import"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
                aria-label="Cancel import"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                aria-label="Import extension"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceDashboard;
