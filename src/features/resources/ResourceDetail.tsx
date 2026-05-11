import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { getResource, deleteResource } from '../../api/resource';
import { useAuth } from '../../auth/authContext';
import { toast } from 'react-toastify';

const fetchResource = async (id: string) => {
  const resource = await getResource(id);
  return resource;
};

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: resource, isLoading, isError, error } = useQuery(['resource', id], () => fetchResource(id));
  const { isAuthenticated, user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteResource(id);
      await queryClient.invalidateQueries('resources');
      toast.success('Resource deleted successfully');
      setIsDeleteModalOpen(false);
      navigate('/resources');
    } catch (err) {
      toast.error('Failed to delete resource');
      console.error('Delete error:', err);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
          <div className="h-10 bg-gray-700 rounded w-32 mb-6"></div>
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="p-4">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">
          Error loading resource: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">{resource.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/resources/${resource.id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={openDeleteModal}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <p className="text-gray-300 mb-6">{resource.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-400 w-32">Created:</span>
                <span className="text-white">{new Date(resource.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Updated:</span>
                <span className="text-white">{new Date(resource.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ResourceDetail;
