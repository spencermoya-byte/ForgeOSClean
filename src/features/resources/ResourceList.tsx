import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getResource, getResources, deleteResource } from '../../api/resource';
import ResourceCard from './ResourceCard';
import { useAuth } from '../../auth/authContext';
import { toast } from 'react-toastify';

const fetchResources = async () => {
  const resources = await getResources();
  return resources;
};

const ResourceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: resources, isLoading, isError, error } = useQuery('resources', fetchResources);
  const { isAuthenticated, user } = useAuth();

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

  const filteredResources = resources?.filter((resource: any) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Resources</h2>
        <button
          onClick={() => navigate('/resources/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Create Resource
        </button>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search resources..."
        className="w-full p-3 mb-6 border rounded-lg bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: any) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
            />
          ))}
        </div>
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
