`<div className="extension-card">
  <div className="extension-header">
    <h3>{extension.name}</h3>
    {extension.hasUpdate && (
      <span className="update-badge">Update Available</span>
    )}
    {extension.isInstalled && !extension.hasUpdate && (
      <span className="version-badge">v{extension.version}</span>
    )}
  </div>
  <div className="extension-body">
    <p>{extension.description}</p>
    <div className="extension-actions">
      {extension.isInstalled ? (
        <button 
          onClick={() => handleUpdate(extension.id)}
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
`
