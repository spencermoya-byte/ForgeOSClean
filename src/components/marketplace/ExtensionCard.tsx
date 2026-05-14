import React from 'react';
import { useExtensionUpdates } from '../../hooks/useExtensionUpdates';

const ExtensionCard = ({ extension, handleUpdate, handleInstall }) => {
  const { hasUpdate, isUpdating, updateExtension } = useExtensionUpdates(extension.id);

  const handleUpdateClick = async () => {
    try {
      await updateExtension();
    } catch (error) {
      console.error('Update failed:', error);
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
              onClick={() => handleInstall(extension.id)}
              className="install-button"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionCard;
