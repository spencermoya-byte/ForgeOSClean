import React, { useState, useEffect } from 'react';

const MarketplaceList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching extensions
    const fetchExtensions = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch extensions');
        console.error(err);
        setLoading(false);
      }
    };

    fetchExtensions();
  }, []);

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

  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <p className="text-gray-400 mt-2">Marketplace content would appear here</p>
      </div>
    </div>
  );
};

export default MarketplaceList;
