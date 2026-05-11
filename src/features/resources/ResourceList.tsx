import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getResource, getResources, deleteResource } from '../../api/resource';
import ResourceCard from './ResourceCard';
import { useAuth } from '../../auth/authContext';
import { toast } from 'react-toastify';

// Debounce function for search
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const fetchResources = async (filters: any) => {
  const response = await getResources(filters);
  return response;
};

const ResourceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalResources, setTotalResources] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: resources, isLoading, isError, error } = useQuery(
    ['resources', searchTerm, sortConfig, currentPage, pageSize],
    () => fetchResources({
      filters: searchTerm,
      sortBy: sortConfig?.key || 'created_at',
      sortOrder: sortConfig?.direction || 'DESC',
      limit: pageSize,
      offset: currentPage * pageSize
    })
  );
  const { isAuthenticated, user } = useAuth();

  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    setCurrentPage(0);
    setSearchTerm(term);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleSort = (key: string) => {
    let direction = 'ASC';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ASC') {
      direction = 'DESC';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    
    try {
      await deleteResource(resourceToDelete);
      await queryClient.invalidateQueries('resources');
      toast.success('Resource deleted successfully');
      setIsDeleteModalOpen(false);
      setResourceToDelete(null);
    } catch (err) {
      toast.error('Failed to delete resource');
      console.error('Delete error:', err);
    }
  };

  const openDeleteModal = (id: string) => {
    setResourceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setResourceToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  useEffect(() => {
    if (resources) {
      setTotalResources(resources.total);
    }
  }, [resources]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="h-10 bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">
          Error loading resources: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalResources / pageSize);

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Resources</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/resources/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Create Resource
          </button>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search resources..."
              className="w-full p-3 border rounded-lg bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-gray-400">
          Showing {Math.min(pageSize, totalResources)} of {totalResources} resources
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {resources?.resources && resources.resources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.resources.map((resource: any) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`px-3 py-1 rounded ${currentPage === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className={`px-3 py-1 rounded ${currentPage === totalPages - 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No resources found</div>
          <button
            onClick={() => navigate('/resources/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Create Your First Resource
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this resource? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList;
