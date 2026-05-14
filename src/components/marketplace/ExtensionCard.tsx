import React, { useState } from 'react';
import { useExtensionUpdates } from '../../hooks/useExtensionUpdates';

const ExtensionCard = ({ extension, handleUpdate, handleInstall }) => {
  const { hasUpdate, isUpdating, updateExtension } = useExtensionUpdates(extension.id);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isInstallLoading, setIsInstallLoading] = useState(false);

  const handleUpdateClick = async () => {
    try {
      await updateExtension();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    // Prevent duplicate clicks during loading
    if (isFavoriteLoading) return;
    
    setIsFavoriteLoading(true);
    try {
      // Simulate API call to toggle favorite
      await fetch(`/api/extensions/${extension.id}/favorite`, {
        method: 'POST',
      });
      
      // In a real implementation, we would update the extension state here
      // For now, we just clear the loading state
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleInstallClick = async () => {
    // Prevent duplicate clicks during installation
    if (isInstallLoading) return;
    
    setIsInstallLoading(true);
    try {
      await handleInstall(extension.id);
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstallLoading(false);
    }
  };

  return (
    <div className="extension-card">
      <div className="extension-header">
        <h3>{extension.name}</h3>
        {hasUpdate && (
          <span className="update-badge">Update Available</span>
        )}
        {extension.isInstalled && !hasUpdate && (
          <span className="version-badge">v{extension.version}</span>
        )}
        <button 
          onClick={handleFavoriteToggle}
          disabled={isFavoriteLoading}
          className={`favorite-button ${extension.isFavorite ? 'favorited' : ''}`}
        >
          {isFavoriteLoading ? '...' : extension.isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div className="extension-body">
        <p>{extension.description}</p>
        <div className="extension-actions">
          {extension.isInstalled ? (
            <button 
              onClick={handleUpdateClick}
              disabled={isUpdating}
              className="update-button"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          ) : (
            <button 
              onClick={handleInstallClick}
              disabled={isInstallLoading}
              className="install-button"
            >
              {isInstallLoading ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionCard;
