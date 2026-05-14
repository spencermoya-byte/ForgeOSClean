import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [sortOption, setSortOption] = useState('name');
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
  const [isEnabling, setIsEnabling] = useState<string | null>(null);
  const [isDisabling, setIsDisabling] = useState<string | null>(null);
  const [isAddingToCollection, setIsAddingToCollection] = useState<string | null>(null);
  const [isRemovingFromCollection, setIsRemovingFromCollection] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionExtensionId, setPermissionExtensionId] = useState<string | null>(null);
  const [permissionExtensionName, setPermissionExtensionName] = useState<string | null>(null);
  const [permissionExtensionPermissions, setPermissionExtensionPermissions] = useState<any[]>([]);
  const [permissionExtensionSafety, setPermissionExtensionSafety] = useState<any>(null);
  const [showSafetyWarningModal, setShowSafetyWarningModal] = useState(false);
  const [safetyWarningExtensionId, setSafetyWarningExtensionId] = useState<string | null>(null);
  const [safetyWarningExtensionName, setSafetyWarningExtensionName] = useState<string | null>(null);
  const [safetyWarningDetails, setSafetyWarningDetails] = useState<any>(null);
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
      runtimeStatus: 'inactive',
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
      runtimeStatus: 'error',
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
      { name: 'read-files', description: 'Read files in the workspace', type: 'filesystem' },
      { name: 'write-files', description: 'Write files in the workspace', type: 'filesystem' },
      { name: 'execute-commands', description: 'Execute system commands', type: 'network' },
      { name: 'access-ai-models', description: 'Access AI models for code analysis', type: 'ai-model' },
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
      tags: ['ai', 'code', 'assistant'],
      permissions: [
        { name: 'read-files', description: 'Read files in the workspace', type: 'filesystem' },
        { name: 'write-files', description: 'Write files in the workspace', type: 'filesystem' },
        { name: 'execute-commands', description: 'Execute system commands', type: 'network' },
        { name: 'access-ai-models', description: 'Access AI models for code analysis', type: 'ai-model' },
      ],
      safetyLevel: 'medium',
      safetyWarnings: [
        'Access to system commands',
        'Access to AI models'
      ]
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
      tags: ['git', 'version-control'],
      permissions: [
        { name: 'read-files', description: 'Read files in the workspace', type: 'filesystem' },
        { name: 'write-files', description: 'Write files in the workspace', type: 'filesystem' },
      ],
      safetyLevel: 'low',
      safetyWarnings: []
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
      tags: ['database', 'sql', 'explorer'],
      permissions: [
        { name: 'read-files', description: 'Read files in the workspace', type: 'filesystem' },
        { name: 'write-files', description: 'Write files in the workspace', type: 'filesystem' },
        { name: 'access-database-drivers', description: 'Access database drivers', type: 'network' },
      ],
      safetyLevel: 'high',
      safetyWarnings: [
        'Incompatible with current ForgeOS version',
        'Missing required dependency: Database Driver v1.0.0'
      ]
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
      tags: ['theme', 'ui', 'customization'],
      permissions: [
        { name: 'read-files', description: 'Read files in the workspace', type: 'filesystem' },
      ],
      safetyLevel: 'low',
      safetyWarnings: []
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

  // Handle refresh with proper state management
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return; // Prevent duplicate refreshes
    
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, this would fetch fresh data from the backend
    }, 500);
  }, [isRefreshing]);

  // Toggle favorite with optimistic UI and proper synchronization
  const toggleFavorite = useCallback((extensionId: string) => {
    if (isTogglingFavorite === extensionId) return; // Prevent duplicate actions
    
    setIsTogglingFavorite(extensionId);
    
    setFavorites(prev => {
      if (prev.includes(extensionId)) {
        return prev.filter(id => id !== extensionId);
      } else {
        return [...prev, extensionId];
      }
    });
    
    // Reset after a short delay to allow UI to update
    setTimeout(() => setIsTogglingFavorite(null), 300);
  }, [isTogglingFavorite]);

  // Create collection with proper validation and error handling
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

  // Update collection name with proper validation
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

  // Delete collection with proper confirmation
  const deleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(col => col.id !== collectionId));
  };

  // Add extension to collection with optimistic UI and proper synchronization
  const addExtensionToCollection = useCallback((collectionId: string, extensionId: string) => {
    if (isAddingToCollection === `${collectionId}-${extensionId}`) return;
    
    setIsAddingToCollection(`${collectionId}-${extensionId}`);
    
    setCollections(prev => 
      prev.map(col => 
        col.id === collectionId 
          ? { ...col, extensions: [...col.extensions, extensionId] } 
          : col
      )
    );
    
    setTimeout(() => setIsAddingToCollection(null), 300);
  }, [isAddingToCollection]);

  // Remove extension from collection with optimistic UI and proper synchronization
  const removeExtensionFromCollection = useCallback((collectionId: string, extensionId: string) => {
    if (isRemovingFromCollection === `${collectionId}-${extensionId}`) return;
    
    setIsRemovingFromCollection(`${collectionId}-${extensionId}`);
    
    setCollections(prev => 
      prev.map(col => 
        col.id === collectionId 
          ? { ...col, extensions: col.extensions.filter(id => id !== extensionId) } 
          : col
      )
    );
    
    setTimeout(() => setIsRemovingFromCollection(null), 300);
  }, [isRemovingFromCollection]);

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportError(null);
    }
  };

  // Handle import with improved error handling and validation
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

  // Install extension with proper state management
  const installExtension = useCallback((extensionId: string) => {
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

  // Confirm installation after showing permissions
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

  // Cancel installation
  const cancelInstallation = () => {
    setShowPermissionModal(false);
    setPermissionExtensionId(null);
    setPermissionExtensionName(null);
    setPermissionExtensionPermissions([]);
    setPermissionExtensionSafety(null);
    setIsInstalling(null);
  };

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
              lastUpdated: new Date().toISOString().split('T')[0]
            } : ext
          )
        );
        
        setDiscoverExtensions(prev => 
          prev.map(ext => 
            ext.id === extensionId ? { 
              ...ext, 
              version: '1.3.0', 
              updateStatus: 'up_to_date',
              lastUpdated: new Date().toISOString().split('T')[0]
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

  // Uninstall extension with proper state management and synchronization
  const uninstallExtension = useCallback((extensionId: string) => {
    if (isInstalling === extensionId || isUpdating === extensionId || isUninstalling === extensionId) return;
    
    setIsUninstalling(extensionId);
    
    // Simulate uninstallation with better synchronization
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
  }, [isInstalling, isUpdating, isUninstalling]);

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
        ext.id === extensionId ? { ...ext, isActive: !ext.isActive } : ext
      )
    );
    
    // Update discover extensions as well
    setDiscoverExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId ? { ...ext, isActive: !ext.isActive } : ext
      )
    );
    
    // Reset after a short delay
    setTimeout(() => {
      setIsEnabling(null);
      setIsDisabling(null);
    }, 300);
  }, [isEnabling, isDisabling, installedExtensions]);

  // Filter and sort extensions with memoization
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
    
    // Apply favorites filter
    if (selectedFilters.favorites && selectedFilters.favorites === true) {
      filtered = filtered.filter(ext => favorites.includes(ext.id));
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
  }, [discoverExtensions, searchQuery, selectedFilters, sortOption, favorites]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedFilters({});
    setSearchQuery('');
  }, []);

  // Get active filters for display
  const getActiveFilters = useCallback(() => {
    const activeFilters = [];
    if (searchQuery) activeFilters.push(`Search: ${searchQuery}`);
    if (selectedFilters.category) activeFilters.push(`Category: ${selectedFilters.category}`);
    if (selectedFilters.tags && selectedFilters.tags.length > 0) activeFilters.push(`Tags: ${selectedFilters.tags.join(', ')}`);
    if (selectedFilters.compatibility) activeFilters.push(`Compatibility: ${selectedFilters.compatibility}`);
    if (selectedFilters.favorites) activeFilters.push('Favorites Only');
    return activeFilters;
  }, [searchQuery, selectedFilters]);

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

  // Safety level badge component
  const SafetyLevelBadge = ({ level, className = '' }: { level: string; className?: string }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-200';
    
    switch (level.toLowerCase()) {
      case 'low':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        break;
      case 'medium':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        break;
      case 'high':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'strict':
        bgColor = 'bg-purple-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-200';
    }
    
    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs ${className}`}>
        {level}
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

  // Extension card component with improved performance
  const ExtensionCard = React.memo(({ extension }: { extension: any }) => {
    const isInstalling = isInstalling === extension.id;
    const isUpdating = isUpdating === extension.id;
    const isUninstalling = isUninstalling === extension.id;
    const isTogglingFavorite = isTogglingFavorite === extension.id;
    const isAddingToCollection = isAddingToCollection === `${extension.id}-collection`;
    const isRemovingFromCollection = isRemovingFromCollection === `${extension.id}-collection`;
    const isUpdatingProgress = updateProgress[extension.id];
    
    return (
      <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white">{extension.name}</h3>
            <p className="text-gray-300 text-sm">v{extension.version}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => toggleFavorite(extension.id)}
              disabled={isTogglingFavorite}
              className="text-gray-400 hover:text-yellow-400 transition duration-200"
              aria-label={favorites.includes(extension.id) ? "Remove from favorites" : "Add to favorites"}
            >
              {isTogglingFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              ) : favorites.includes(extension.id) ? (
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
            <SafetyLevelBadge level={extension.safetyLevel} className="ml-2" />
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
        
        {/* Update progress indicator */}
        {isUpdatingProgress && (
          <div className="mt-3">
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${isUpdatingProgress.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {isUpdatingProgress.status} ({isUpdatingProgress.progress}%)
            </div>
          </div>
        )}
        
        {/* Safety warnings */}
        {extension.safetyWarnings && extension.safetyWarnings.length > 0 && (
          <div className="mt-3">
            <div className="flex items-start">
              <svg className="h-4 w-4 text-red-400 mt-0.5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-red-300">
                {extension.safetyWarnings.slice(0, 2).join(', ')}
                {extension.safetyWarnings.length > 2 && ` +${extension.safetyWarnings.length - 2} more`}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

  // Extension detail component with improved performance
  const ExtensionDetail = React.memo(({ extension }: { extension: any }) => {
    const isInstalling = isInstalling === extension.id;
    const isUpdating = isUpdating === extension.id;
    const isUninstalling = isUninstalling === extension.id;
    const isEnabling = isEnabling === extension.id;
    const isDisabling = isDisabling === extension.id;
    const isTogglingFavorite = isTogglingFavorite === extension.id;
    const isUpdatingProgress = updateProgress[extension.id];
    
    return (
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
                      disabled={isTogglingFavorite}
                      className="text-gray-400 hover:text-yellow-400 transition duration-200"
                      aria-label={favorites.includes(extension.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isTogglingFavorite ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      ) : favorites.includes(extension.id) ? (
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
                      disabled={isEnabling || isDisabling}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
                      aria-label={extension.isActive ? "Disable extension" : "Enable extension"}
                    >
                      {isEnabling || isDisabling ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      disabled={isInstalling}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                      aria-label="Install extension"
                    >
                      {isInstalling ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Installing...
                        </span>
                      ) : 'Install'}
                    </button>
                  )}
                  <button
                    onClick={() => handleExport(extension.id)}
                    disabled={exportExtensionId === extension.id && exportStatus === 'exporting'}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                    aria-label={`Export ${extension.name} extension`}
                  >
                    {exportExtensionId === extension.id && exportStatus === 'exporting' ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                      </span>
                    ) : 'Export'}
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mt-4">{extension.description}</p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-sm text-gray-400">Author: {extension.author}</span>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-sm text-gray-300">{extension.rating} ({extension.downloads.toLocaleString()} downloads)</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Version: {extension.version}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Extension Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Compatibility</h4>
              <div className="flex items-center">
                <StatusBadge status={extension.compatibility} />
                <span className="ml-2 text-gray-300">{extension.compatibility}</span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-300">ForgeOS: {extension.compatibilityDetails.forgeosVersion}</p>
                <p className="text-sm text-gray-300">Node.js: {extension.compatibilityDetails.nodeVersion}</p>
                <p className="text-sm text-gray-300">OS: {extension.compatibilityDetails.os.join(', ')}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Permissions</h4>
              <div className="space-y-2">
                {extension.permissions.map((permission: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">{permission.name}</p>
                      <p className="text-gray-300 text-sm">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-white mb-2">Version History</h4>
            <div className="space-y-2">
              {extension.versionHistory.map((version: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <span className="text-white font-medium">v{version.version}</span>
                    <span className="text-gray-400 ml-2">{version.date}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{version.changes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Render the marketplace dashboard
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['discover', 'installed', 'import-export'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Discover Extensions</h2>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Import Extension
              </button>
            </div>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search extensions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="newest">Sort by Newest</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="downloads">Sort by Downloads</option>
                  </select>
                </div>
              </div>
            </div>

            {discoverExtensions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedExtensions().map((extension) => (
                  <ExtensionCard key={extension.id} extension={extension} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No extensions found</div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Import Extension
                </button>
              </div>
            )}
          </div>
        )}

        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Installed Extensions</h2>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Import Extension
              </button>
            </div>

            {installedExtensions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installedExtensions.map((extension) => (
                  <ExtensionCard key={extension.id} extension={extension} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No extensions installed</div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Import Extension
                </button>
              </div>
            )}
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Import & Export</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-4">Import Extension</h3>
                <p className="text-gray-300 mb-4">
                  Import an extension package from your local system. 
                  Supported formats: .zip, .forgeos
                </p>
                
                <div className="mb-4">
                  <label className="block text-white mb-2">Select Extension File</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".zip,.forgeos"
                      className="hidden"
                      aria-label="Select extension file"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
                    >
                      Choose File
                    </button>
                    {importFile && (
                      <span className="text-gray-300 truncate max-w-xs">{importFile.name}</span>
                    )}
                  </div>
                </div>

                {importError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{importError}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    {importStatus === 'validating' && (
                      <div className="flex items-center text-yellow-400">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validating package...
                      </div>
                    )}
                    {importStatus === 'review' && (
                      <div className="text-green-400">Package validated successfully</div>
                    )}
                    {importStatus === 'importing' && (
                      <div className="flex items-center text-blue-400">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Installing extension...
                      </div>
                    )}
                    {importStatus === 'success' && (
                      <div className="text-green-400">Extension imported successfully!</div>
                    )}
                    {importStatus === 'error' && (
                      <div className="text-red-400">Import failed. Please check the error message above.</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelImport}
                      disabled={importStatus === 'importing' || importStatus === 'validating'}
                      className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!importFile || importStatus !== 'idle'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 disabled:opacity-50"
                    >
                      Validate & Import
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-4">Export Extension</h3>
                <p className="text-gray-300 mb-4">
                  Export installed extensions to local files for backup or sharing.
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
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition duration-200 disabled:opacity-50"
                          aria-label={`Export ${extension.name} extension`}
                        >
                          {exportExtensionId === extension.id && exportStatus === 'exporting' ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Exporting...
                            </span>
                          ) : 'Export'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {exportStatus === 'preparing' && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-300 text-sm">Preparing export...</p>
                  </div>
                )}
                
                {exportStatus === 'exporting' && exportExtensionId && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-300 text-sm">Exporting extension...</p>
                  </div>
                )}
                
                {exportStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-300 text-sm">Extension exported successfully!</p>
                  </div>
                )}
                
                {exportStatus === 'error' && exportError && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{exportError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Permission Review Modal */}
        {showPermissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="permission-modal-title">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 id="permission-modal-title" className="text-xl font-bold text-white mb-4">Install Extension</h3>
              <p className="text-gray-300 mb-4">
                Before installing <span className="font-semibold">{permissionExtensionName}</span>, please review the permissions this extension requests:
              </p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-2">Extension Permissions</h4>
                <div className="space-y-3">
                  {permissionExtensionPermissions.map((permission, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div>
                          <p className="text-white font-medium">{permission.name}</p>
                          <p className="text-gray-300 text-sm">{permission.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelInstallation}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmInstallation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                >
                  Install Extension
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
