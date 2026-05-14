import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplaceDashboard: React.FC = () => {
  // ... existing code ...

  // Filter and sort extensions with memoization and improved empty state handling
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

  // ... rest of existing code ...
  
  return (
    // ... existing JSX ...
    {discoverExtensions.length > 0 ? (
      <div>
        {filteredAndSortedExtensions().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedExtensions().map((extension) => (
              <ExtensionCard key={extension.id} extension={extension} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No extensions match your search criteria</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilters({});
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Clear Search
            </button>
          </div>
        )}
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
    // ... rest of existing JSX ...
  );
};

export default MarketplaceDashboard;
