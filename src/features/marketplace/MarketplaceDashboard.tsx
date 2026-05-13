import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImportFile(file);
      validateImportFile(file);
    }
  };

  // Validate import file
  const validateImportFile = (file: File) => {
    setImportStatus('validating');
    setImportError(null);
    
    // Simulate validation process
    setTimeout(() => {
      // In a real implementation, this would check:
      // - File extension (.zip, .forgeos, .plugin)
      // - File integrity
      // - Extension metadata structure
      // - Compatibility with current ForgeOS version
      
      if (file.name.endsWith('.zip') || file.name.endsWith('.forgeos')) {
        // Simulate successful validation
        setImportStatus('review');
        setImportReview({
          name: 'Sample Extension',
          version: '1.0.0',
          author: 'ForgeOS Team',
          description: 'A sample extension for demonstration purposes',
          permissions: ['read-files', 'write-files'],
          compatibility: 'Compatible',
          dependencies: [
            { name: 'ForgeOS Core', version: '2.0.0', isInstalled: true }
          ]
        });
      } else {
        setImportStatus('error');
        setImportError('Unsupported file format. Please select a .zip or .forgeos file.');
      }
    }, 1000);
  };

  // Handle import confirmation
  const handleImportConfirm = () => {
    if (!importFile) return;
    
    setImportStatus('importing');
    
    // Simulate import process
    setTimeout(() => {
      setImportStatus('success');
      // In a real implementation, this would actually install the extension
    }, 2000);
  };

  // Reset import process
  const resetImport = () => {
    setImportStatus('idle');
    setImportFile(null);
    setImportReview(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle export
  const handleExport = (extensionId: string) => {
    setExportExtensionId(extensionId);
    setShowExportModal(true);
    setExportStatus('preparing');
    
    // Simulate export preparation
    setTimeout(() => {
      setExportStatus('exporting');
      
      // Simulate export process
      setTimeout(() => {
        setExportStatus('success');
        // In a real implementation, this would download the extension file
      }, 1500);
    }, 500);
  };

  // Reset export process
  const resetExport = () => {
    setShowExportModal(false);
    setExportExtensionId(null);
    setExportStatus('idle');
    setExportError(null);
  };

  // Open uninstall confirmation
  const openUninstallModal = (id: string, name: string) => {
    setUninstallExtensionId(id);
    setUninstallExtensionName(name);
    setShowUninstallModal(true);
  };

  // Close uninstall confirmation
  const closeUninstallModal = () => {
    setShowUninstallModal(false);
    setUninstallExtensionId(null);
    setUninstallExtensionName(null);
  };

  // Confirm uninstall
  const confirmUninstall = () => {
    if (!uninstallExtensionId) return;
    
    // In a real implementation, this would call the uninstall API
    closeUninstallModal();
    // Show success message or handle accordingly
  };

  // Open recovery modal
  const openRecoveryModal = (id: string) => {
    setRecoveryExtensionId(id);
    setShowRecoveryModal(true);
    
    // Simulate fetching recovery status
    setTimeout(() => {
      setRecoveryStatus({
        lastError: 'Extension failed to enable after update',
        lastErrorTime: '2023-06-10 14:30:00',
        recoveryAvailable: true,
        rollbackAvailable: true,
        lastSuccessfulVersion: '1.2.0',
        currentVersion: '1.3.0',
        errorDetails: 'Failed to initialize AI engine component'
      });
    }, 500);
  };

  // Close recovery modal
  const closeRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryExtensionId(null);
    setRecoveryStatus(null);
  };

  // Open rollback modal
  const openRollbackModal = (id: string, version: string) => {
    setRollbackExtensionId(id);
    setRollbackVersion(version);
    setShowRollbackModal(true);
  };

  // Close rollback modal
  const closeRollbackModal = () => {
    setShowRollbackModal(false);
    setRollbackExtensionId(null);
    setRollbackVersion(null);
  };

  // Confirm rollback
  const confirmRollback = () => {
    if (!rollbackExtensionId || !rollbackVersion) return;
    
    // In a real implementation, this would call the rollback API
    closeRollbackModal();
    // Show success message or handle accordingly
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
    },
    {
      id: '6',
      name: 'AI Code Generator',
      version: '1.0.0',
      description: 'Generate code snippets using AI',
      author: 'ForgeOS Team',
      rating: 4.3,
      downloads: 4200,
      category: 'Development Tools',
      tags: ['ai', 'code', 'generator'],
      isInstalled: false,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'Development Tools',
      tags: ['ai', 'code', 'generator']
    },
    {
      id: '7',
      name: 'API Client',
      version: '0.5.0',
      description: 'REST API testing and debugging tool',
      author: 'ForgeOS Team',
      rating: 4.1,
      downloads: 2800,
      category: 'Development Tools',
      tags: ['api', 'testing', 'debugging'],
      isInstalled: false,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'Development Tools',
      tags: ['api', 'testing', 'debugging']
    },
    {
      id: '8',
      name: 'Markdown Editor',
      version: '1.2.1',
      description: 'Rich text editor for Markdown files',
      author: 'ForgeOS Team',
      rating: 4.4,
      downloads: 5600,
      category: 'Productivity',
      tags: ['markdown', 'editor', 'writing'],
      isInstalled: false,
      compatibility: 'Compatible',
      compatibilityDetails: {
        forgeosVersion: '>=2.0.0',
        nodeVersion: '>=14.0.0',
        os: ['Windows', 'macOS', 'Linux']
      },
      category: 'Productivity',
      tags: ['markdown', 'editor', 'writing']
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
      case 'running':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'inactive':
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-300';
        break;
      case 'error':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'supported':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'unsupported':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'partial':
        bgColor = 'bg-yellow-600';
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

  // Onboarding steps
  const onboardingSteps = [
    {
      title: "Welcome to ForgeOS Marketplace",
      content: "This is where you can discover, install, and manage extensions to enhance your ForgeOS experience. All extensions are installed locally and never uploaded to any server.",
      icon: "📦"
    },
    {
      title: "Local-Only Extensions",
      content: "Extensions installed from the marketplace are stored locally on your device. They work completely offline and never transmit your data to external servers.",
      icon: "🔒"
    },
    {
      title: "Permission Review",
      content: "Before installing any extension, you'll see exactly what permissions it requests. You can review these before confirming installation.",
      icon: "🛡️"
    },
    {
      title: "Compatibility Checks",
      content: "ForgeOS checks if extensions are compatible with your current version. Incompatible extensions will be marked clearly.",
      icon: "⚙️"
    },
    {
      title: "Manage Your Extensions",
      content: "Once installed, you can enable/disable, update, or uninstall extensions from the 'Installed Extensions' tab.",
      icon: "🔧"
    }
  ];

  // Close onboarding
  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  // Next onboarding step
  const nextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      closeOnboarding();
    }
  };

  // Previous onboarding step
  const prevOnboardingStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Inline help component
  const InlineHelp = ({ title, content }: { title: string; content: string }) => {
    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-xl">ℹ️</span>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">{title}</h4>
            <p className="text-gray-300 text-sm">{content}</p>
          </div>
        </div>
      </div>
    );
  };

  // Safety guidance component
  const SafetyGuidance = ({ title, content, icon }: { title: string; content: string; icon: string }) => {
    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">{title}</h4>
            <p className="text-gray-300 text-sm">{content}</p>
          </div>
        </div>
      </div>
    );
  };

  // Empty state component
  const EmptyState = ({ title, description, action, icon }: { title: string; description: string; action?: React.ReactNode; icon?: string }) => {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">{icon || '📦'}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  };

  // Category navigation component
  const CategoryNavigation = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Browse by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('category', '')}
            className={`px-3 py-1 rounded-full text-sm transition duration-200 ${
              !selectedFilters.category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Extensions
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange('category', category)}
              className={`px-3 py-1 rounded-full text-sm transition duration-200 ${
                selectedFilters.category === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Category filter dropdown component
  const CategoryFilterDropdown = () => {
    return (
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Filter by Category</label>
        <select
          value={selectedFilters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
    );
  };

  // Tag filter component
  const TagFilter = () => {
    return (
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Filter by Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleFilterChange('tag', tag)}
              className={`px-3 py-1 rounded-full text-sm transition duration-200 ${
                selectedFilters.tag === tag 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Breadcrumb component
  const Breadcrumb = () => {
    const breadcrumbs = [
      { name: 'Marketplace', path: '/marketplace' },
      { name: activeTab === 'discover' ? 'Discover' : 
        activeTab === 'installed' ? 'Installed' : 
        activeTab === 'updates' ? 'Updates' : 
        activeTab === 'favorites' ? 'Favorites' : 
        activeTab === 'collections' ? 'Collections' : 
        activeTab === 'import-export' ? 'Import/Export' : 
        activeTab === 'recovery' ? 'Recovery' : 
        activeTab === 'details' ? 'Details' : 'Marketplace' }
    ];

    return (
      <div className="flex items-center text-sm text-gray-400 mb-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-2">/</span>}
            <span className={index === breadcrumbs.length - 1 ? "text-white" : "hover:text-white cursor-pointer"}>
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Runtime status panel component
  const RuntimeStatusPanel = ({ extension }: { extension: any }) => {
    if (!extension.runtimeStatus) {
      return (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-white mb-2">Runtime Status</h4>
          <p className="text-gray-300 text-sm">Runtime information is not available for this extension.</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-2">Runtime Status</h4>
        <div className="flex items-center mb-3">
          <StatusBadge status={extension.runtimeStatus} label={extension.runtimeStatus} />
          <span className="ml-2 text-gray-300">
            {extension.runtimeStatus === 'running' && 'Extension is actively running'}
            {extension.runtimeStatus === 'inactive' && 'Extension is not active'}
            {extension.runtimeStatus === 'error' && 'Extension encountered an error'}
          </span>
        </div>
        
        {extension.runtimeStatus === 'running' && extension.processInfo && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Process Information</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Processes:</span>
                <span className="text-white">{extension.processInfo.activeProcesses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Memory Usage:</span>
                <span className="text-white">{extension.processInfo.memoryUsage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Usage:</span>
                <span className="text-white">{extension.processInfo.cpuUsage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-white">{extension.processInfo.lastActivity}</span>
              </div>
            </div>
          </div>
        )}
        
        {extension.resourceWarnings && extension.resourceWarnings.length > 0 && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Resource Warnings</h5>
            <ul className="list-disc pl-5 text-sm text-yellow-300 space-y-1">
              {extension.resourceWarnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Extension detail runtime panel
  const ExtensionRuntimePanel = ({ extension }: { extension: any }) => {
    if (!extension.runtimeStatus) {
      return (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-white mb-2">Runtime Information</h4>
          <p className="text-gray-300 text-sm">Runtime information is not available for this extension.</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-2">Runtime Information</h4>
        <div className="flex items-center mb-3">
          <StatusBadge status={extension.runtimeStatus} label={extension.runtimeStatus} />
          <span className="ml-2 text-gray-300">
            {extension.runtimeStatus === 'running' && 'Extension is actively running'}
            {extension.runtimeStatus === 'inactive' && 'Extension is not active'}
            {extension.runtimeStatus === 'error' && 'Extension encountered an error'}
          </span>
        </div>
        
        {extension.runtimeStatus === 'running' && extension.processInfo && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Process Information</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Processes:</span>
                <span className="text-white">{extension.processInfo.activeProcesses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Memory Usage:</span>
                <span className="text-white">{extension.processInfo.memoryUsage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Usage:</span>
                <span className="text-white">{extension.processInfo.cpuUsage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-white">{extension.processInfo.lastActivity}</span>
              </div>
            </div>
          </div>
        )}
        
        {extension.resourceWarnings && extension.resourceWarnings.length > 0 && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Resource Warnings</h5>
            <ul className="list-disc pl-5 text-sm text-yellow-300 space-y-1">
              {extension.resourceWarnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Preflight safety panel component
  const PreflightSafetyPanel = ({ extension }: { extension: any }) => {
    if (!extension.preflightStatus) {
      return (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-white mb-2">Preflight Safety Review</h4>
          <p className="text-gray-300 text-sm">Preflight safety information is not available for this extension.</p>
        </div>
      );
    }

    const { 
      permissionsReady, 
      compatibilityReady, 
      dependenciesReady, 
      runtimeSupportReady, 
      sandboxSupport, 
      sandboxEnabled,
      warnings 
    } = extension.preflightStatus;

    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-2">Preflight Safety Review</h4>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Checklist</h5>
          <div className="space-y-2">
            <div className="flex items-center">
              <StatusBadge status={permissionsReady ? 'supported' : 'error'} label={permissionsReady ? 'Permissions Ready' : 'Permissions Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Permissions review</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={compatibilityReady ? 'supported' : 'error'} label={compatibilityReady ? 'Compatibility Ready' : 'Compatibility Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Compatibility check</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={dependenciesReady ? 'supported' : 'error'} label={dependenciesReady ? 'Dependencies Ready' : 'Dependencies Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Dependencies check</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={runtimeSupportReady ? 'supported' : 'error'} label={runtimeSupportReady ? 'Runtime Ready' : 'Runtime Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Runtime support</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Sandbox Status</h5>
          <div className="flex items-center">
            <StatusBadge status={sandboxSupport} label={sandboxSupport === 'supported' ? 'Sandbox Supported' : sandboxSupport === 'unsupported' ? 'Sandbox Unsupported' : 'Sandbox Unknown'} />
            <span className="ml-2 text-gray-300 text-sm">
              {sandboxSupport === 'supported' && sandboxEnabled 
                ? 'Sandbox enabled' 
                : sandboxSupport === 'supported' 
                  ? 'Sandbox available but not enabled' 
                  : sandboxSupport === 'unsupported' 
                    ? 'Sandbox not supported' 
                    : 'Sandbox status unknown'}
            </span>
          </div>
        </div>
        
        {warnings && warnings.length > 0 && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Safety Warnings</h5>
            <ul className="list-disc pl-5 text-sm text-yellow-300 space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Extension detail preflight panel
  const ExtensionPreflightPanel = ({ extension }: { extension: any }) => {
    if (!extension.preflightStatus) {
      return (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-white mb-2">Preflight Safety Review</h4>
          <p className="text-gray-300 text-sm">Preflight safety information is not available for this extension.</p>
        </div>
      );
    }

    const { 
      permissionsReady, 
      compatibilityReady, 
      dependenciesReady, 
      runtimeSupportReady, 
      sandboxSupport, 
      sandboxEnabled,
      warnings 
    } = extension.preflightStatus;

    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-2">Preflight Safety Review</h4>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Checklist</h5>
          <div className="space-y-2">
            <div className="flex items-center">
              <StatusBadge status={permissionsReady ? 'supported' : 'error'} label={permissionsReady ? 'Permissions Ready' : 'Permissions Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Permissions review</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={compatibilityReady ? 'supported' : 'error'} label={compatibilityReady ? 'Compatibility Ready' : 'Compatibility Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Compatibility check</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={dependenciesReady ? 'supported' : 'error'} label={dependenciesReady ? 'Dependencies Ready' : 'Dependencies Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Dependencies check</span>
            </div>
            <div className="flex items-center">
              <StatusBadge status={runtimeSupportReady ? 'supported' : 'error'} label={runtimeSupportReady ? 'Runtime Ready' : 'Runtime Issue'} />
              <span className="ml-2 text-gray-300 text-sm">Runtime support</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Sandbox Status</h5>
          <div className="flex items-center">
            <StatusBadge status={sandboxSupport} label={sandboxSupport === 'supported' ? 'Sandbox Supported' : sandboxSupport === 'unsupported' ? 'Sandbox Unsupported' : 'Sandbox Unknown'} />
            <span className="ml-2 text-gray-300 text-sm">
              {sandboxSupport === 'supported' && sandboxEnabled 
                ? 'Sandbox enabled' 
                : sandboxSupport === 'supported' 
                  ? 'Sandbox available but not enabled' 
                  : sandboxSupport === 'unsupported' 
                    ? 'Sandbox not supported' 
                    : 'Sandbox status unknown'}
            </span>
          </div>
        </div>
        
        {warnings && warnings.length > 0 && (
          <div className="mt-3">
            <h5 className="font-medium text-gray-300 mb-2">Safety Warnings</h5>
            <ul className="list-disc pl-5 text-sm text-yellow-300 space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Import review panel
  const ImportReviewPanel = ({ review }: { review: any }) => {
    if (!review) return null;
    
    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-2">Import Safety Review</h4>
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Extension Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="text-white ml-2">{review.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Version:</span>
              <span className="text-white ml-2">{review.version}</span>
            </div>
            <div>
              <span className="text-gray-400">Author:</span>
              <span className="text-white ml-2">{review.author}</span>
            </div>
            <div>
              <span className="text-gray-400">Compatibility:</span>
              <span className="text-white ml-2">{review.compatibility}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Required Permissions</h5>
          <div className="space-y-1">
            {review.permissions.map((permission: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-400 mr-2">•</span>
                <span className="text-white">{permission}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <h5 className="font-medium text-gray-300 mb-2">Dependencies</h5>
          <div className="space-y-1">
            {review.dependencies.map((dep: any, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-400 mr-2">•</span>
                <span className="text-white">{dep.name} v{dep.version}</span>
                {dep.isInstalled ? (
                  <span className="ml-2 text-green-400 text-sm">Installed</span>
                ) : (
                  <span className="ml-2 text-yellow-400 text-sm">Missing</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
          <h5 className="font-medium text-yellow-300 mb-2">Important Notice</h5>
          <p className="text-sm text-yellow-200">
            This extension will be installed locally on your device. 
            All extensions are sandboxed and never transmit data to external servers.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{onboardingSteps[onboardingStep].title}</h2>
              <button 
                onClick={closeOnboarding}
                className="text-gray-400 hover:text-white"
                aria-label="Close onboarding"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{onboardingSteps[onboardingStep].icon}</div>
              <p className="text-gray-300 text-lg">{onboardingSteps[onboardingStep].content}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={prevOnboardingStep}
                disabled={onboardingStep === 0}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  onboardingStep === 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Back
              </button>
              
              <div className="flex space-x-2">
                {onboardingSteps.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-3 h-3 rounded-full ${
                      index === onboardingStep ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextOnboardingStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
              >
                {onboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      onClick={() => handleTabChange('import-export')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'import-export' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Import/Export
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('recovery')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                        activeTab === 'recovery' 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Recovery
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
              <Breadcrumb />
              
              <h2 className="text-2xl font-bold mb-6">
                {activeTab === 'discover' && 'Discover Extensions'}
                {activeTab === 'installed' && 'Installed Extensions'}
                {activeTab === 'updates' && 'Available Updates'}
                {activeTab === 'favorites' && 'Favorite Extensions'}
                {activeTab === 'collections' && 'My Collections'}
                {activeTab === 'import-export' && 'Import/Export Extensions'}
                {activeTab === 'recovery' && 'Extension Recovery'}
                {activeTab === 'details' && 'Extension Details'}
              </h2>

              {/* Recovery Tab */}
              {activeTab === 'recovery' && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Extension Recovery</h3>
                    <p className="text-gray-300">Manage problematic extensions and access recovery options.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Recovery Status</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white">Code Assistant</h4>
                            <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">Error</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">Failed to initialize AI engine component</p>
                          <p className="text-gray-400 text-xs">Last error: 2023-06-10 14:30:00</p>
                          <div className="mt-3 flex space-x-2">
                            <button 
                              onClick={() => openRecoveryModal('1')}
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
                            >
                              View Recovery Options
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-600 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white">Database Explorer</h4>
                            <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">Incompatible</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">Incompatible with current ForgeOS version</p>
                          <p className="text-gray-400 text-xs">Last error: 2023-06-01 09:15:00</p>
                          <div className="mt-3 flex space-x-2">
                            <button 
                              onClick={() => openRecoveryModal('3')}
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
                            >
                              View Recovery Options
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-green-900/30 rounded-lg border border-green-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white">Git Integration</h4>
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Healthy</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">No issues detected</p>
                          <p className="text-gray-400 text-xs">Last checked: 2023-06-15 10:00:00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Recovery Actions</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-600 rounded-lg">
                          <h4 className="font-semibold text-white mb-2">Safe Mode</h4>
                          <p className="text-gray-300 text-sm mb-3">Enable safe mode to prevent problematic extensions from running</p>
                          <button className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition duration-200">
                            Enable Safe Mode
                          </button>
                        </div>
                        
                        <div className="p-4 bg-gray-600 rounded-lg">
                          <h4 className="font-semibold text-white mb-2">Extension Diagnostics</h4>
                          <p className="text-gray-300 text-sm mb-3">Run diagnostics to identify extension issues</p>
                          <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200">
                            Run Diagnostics
                          </button>
                        </div>
                        
                        <div className="p-4 bg-gray-600 rounded-lg">
                          <h4 className="font-semibold text-white mb-2">System Restore</h4>
                          <p className="text-gray-300 text-sm mb-3">Restore system to a previous state before extension issues</p>
                          <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition duration-200">
                            Restore System
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import/Export Tab */}
              {activeTab === 'import-export' && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Local Extension Import/Export</h3>
                    <p className="text-gray-300">Manage extensions using local files without external communication.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Import Card */}
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Import Extension</h3>
                      <p className="text-gray-300 mb-4">
                        Import extensions from local files. All imports are processed locally and never uploaded to any server.
                      </p>
                      
                      <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition duration-200 mb-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                      >
                        Select Extension File
                      </button>
                    </div>
                    
                    {/* Export Card */}
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Export Extension</h3>
                      <p className="text-gray-300 mb-4">
                        Export installed extensions to local files for sharing or backup.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-600 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-white">Code Assistant</h4>
                              <p className="text-sm text-gray-300">v1.2.3</p>
                            </div>
                            <button
                              onClick={() => handleExport('1')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                            >
                              Export
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-600 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-white">Git Integration</h4>
                              <p className="text-sm text-gray-300">v0.9.1</p>
                            </div>
                            <button
                              onClick={() => handleExport('2')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                            >
                              Export
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-600 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-white">Database Explorer</h4>
                              <p className="text-sm text-gray-300">v2.1.0</p>
                            </div>
                            <button
                              onClick={() => handleExport('3')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                            >
                              Export
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Import Status */}
                  {importStatus !== 'idle' && (
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">
                        {importStatus === 'validating' && 'Validating Extension'}
                        {importStatus === 'review' && 'Import Review'}
                        {importStatus === 'importing' && 'Installing Extension'}
                        {importStatus === 'success' && 'Import Successful'}
                        {importStatus === 'error' && 'Import Error'}
                      </h3>
                      
                      {importStatus === 'validating' && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                          <p className="text-gray-300">Validating extension file...</p>
                        </div>
                      )}
                      
                      {importStatus === 'review' && importReview && (
                        <div className="space-y-4">
                          <ImportReviewPanel review={importReview} />
                          
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={resetImport}
                              className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleImportConfirm}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                            >
                              Install Extension
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {importStatus === 'importing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                          <p className="text-gray-300">Installing extension...</p>
                        </div>
                      )}
                      
                      {importStatus === 'success' && (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-4">✅</div>
                          <h4 className="text-xl font-semibold text-white mb-2">Installation Successful!</h4>
                          <p className="text-gray-300 mb-4">The extension has been installed successfully.</p>
                          <button
                            onClick={resetImport}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                          >
                            Close
                          </button>
                        </div>
                      )}
                      
                      {importStatus === 'error' && importError && (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-4">⚠️</div>
                          <h4 className="text-xl font-semibold text-white mb-2">Installation Failed</h4>
                          <p className="text-gray-300 mb-4">{importError}</p>
                          <button
                            onClick={resetImport}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discover' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Discover New Extensions</h3>
                    <p className="text-gray-300">Browse and install extensions to enhance your ForgeOS experience.</p>
                  </div>
                  
                  {/* Category Navigation */}
                  <CategoryNavigation />
                  
                  {/* Safety Guidance for Discover Tab */}
                  <div className="space-y-4">
                    <SafetyGuidance 
                      title="Local-Only Installation" 
                      content="All extensions are installed locally on your device and never uploaded to any server." 
                      icon="🔒"
                    />
                    <SafetyGuidance 
                      title="Permission Review" 
                      content="Before installing any extension, you'll see exactly what permissions it requests." 
                      icon="🛡️"
                    />
                    <SafetyGuidance 
                      title="Compatibility Check" 
                      content="ForgeOS checks if extensions are compatible with your current version." 
                      icon="⚙️"
                    />
                  </div>
                  
                  {/* Filters Section */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Search Extensions</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search by name, description, author..."
                        />
                      </div>
                      
                      <CategoryFilterDropdown />
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Sort By</label>
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    {activeFilters.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-300">Active Filters</h4>
                          <button 
                            onClick={clearAllFilters}
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tag Filter */}
                  <TagFilter />
                  
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
                  
                  {/* Safety Guidance for Installed Tab */}
                  <div className="space-y-4">
                    <SafetyGuidance 
                      title="Extension Management" 
                      content="You can enable/disable, update, or uninstall extensions from here." 
                      icon="🔧"
                    />
                    <SafetyGuidance 
                      title="Local-Only Operation" 
                      content="All installed extensions work completely offline and never transmit data." 
                      icon="🔒"
                    />
                    <SafetyGuidance 
                      title="Problematic Extensions" 
                      content="If an extension causes issues, you can disable it or use the recovery tools." 
                      icon="⚠️"
                    />
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
                          
                          <PreflightSafetyPanel extension={extension} />
                          
                          <RuntimeStatusPanel extension={extension} />
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                              Installed: {extension.lastUpdated}
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition duration-200">
                                Settings
                              </button>
                              <button 
                                onClick={() => openUninstallModal(extension.id, extension.name)}
                                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-200"
                              >
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
                    <p className="text-gray-300">View detailed information about this extension.</p>
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
                    
                    {/* Preflight Safety Review */}
                    <ExtensionPreflightPanel extension={extensionDetails} />
                    
                    {/* Runtime Information */}
                    <ExtensionRuntimePanel extension={extensionDetails} />
                    
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
                            <div className="flex justify-between">
                              <span className="text-gray-300">Version: {dep.version}</span>
                              <span className="text-gray-300">Status: {dep.isInstalled ? 'Installed' : dep.isCompatible ? 'Compatible' : 'Incompatible'}</span>
                            </div>
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

      {/* Uninstall Confirmation Modal */}
      {showUninstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Uninstall Extension</h3>
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
                onClick={closeUninstallModal}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmUninstall}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
              >
                Uninstall Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Recovery Options for {recoveryStatus?.lastSuccessfulVersion ? 'Code Assistant' : 'Database Explorer'}</h3>
            
            {recoveryStatus && (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Error Details</h4>
                  <p className="text-gray-300 mb-2">{recoveryStatus.lastError}</p>
                  <p className="text-gray-400 text-sm">Error occurred: {recoveryStatus.lastErrorTime}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Rollback to Previous Version</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Revert to version {recoveryStatus.lastSuccessfulVersion} to restore functionality.
                    </p>
                    <button 
                      onClick={() => {
                        closeRecoveryModal();
                        openRollbackModal('1', recoveryStatus.lastSuccessfulVersion);
                      }}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
                    >
                      Rollback to {recoveryStatus.lastSuccessfulVersion}
                    </button>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Safe Mode</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Enable safe mode to prevent this extension from running until issues are resolved.
                    </p>
                    <button className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition duration-200">
                      Enable Safe Mode
                    </button>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Diagnostic Tools</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Run diagnostics to identify the root cause of the issue.
                    </p>
                    <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition duration-200">
                      Run Diagnostics
                    </button>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Extension Settings</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Review and reset extension settings to default values.
                    </p>
                    <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-200">
                      Reset Settings
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Recovery Status</h4>
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Rollback functionality available</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Safe mode available</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-2">⚠</span>
                    <span className="text-gray-300">Settings reset may not restore all data</span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={closeRecoveryModal}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Rollback Extension</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to rollback <span className="font-semibold">{rollbackExtensionId}</span> to version {rollbackVersion}? 
              This action will restore the extension to its previous state.
            </p>
            
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-white mb-2">Important Notice</h4>
              <p className="text-gray-300 text-sm">
                Rolling back to a previous version may not restore all user data or settings. 
                Some configuration changes may be lost.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRollbackModal}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRollback}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
              >
                Rollback Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Import Extension</h3>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Select an extension file to import:</p>
              <input
                type="file"
                accept=".zip,.forgeos"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
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
