import { useState, useEffect } from 'react';

export const useExtensionUpdates = (extensionId: string) => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkForUpdate = async () => {
    // Simulate API call to check for updates
    try {
      // This would normally be an API call
      const response = await fetch(`/api/extensions/${extensionId}/update`);
      const data = await response.json();
      setHasUpdate(data.hasUpdate);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const updateExtension = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call to update extension
      await fetch(`/api/extensions/${extensionId}/update`, {
        method: 'POST',
      });
      
      // Clear the update badge after successful update
      setHasUpdate(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to update extension:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, [extensionId]);

  return {
    hasUpdate,
    isUpdating,
    updateExtension,
    lastUpdated
  };
};
