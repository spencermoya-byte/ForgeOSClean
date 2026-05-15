import React from 'react';

type ExtensionCardProps = {
  extension: any;
};

const ExtensionCard = ({ extension }: ExtensionCardProps) => {
  return (
    <div className="extension-card">
      <div className="extension-header">
        <h3>{extension?.name || 'Extension Name'}</h3>
      </div>
      <div className="extension-body">
        <p>{extension?.description || 'Extension description'}</p>
      </div>
    </div>
  );
};

export default ExtensionCard;
