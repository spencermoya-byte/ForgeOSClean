import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { createResource, updateResource } from '../../api/resource';
import { toast } from 'react-toastify';

interface ResourceFormData {
  name: string;
  description: string;
}

interface ResourceFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ initialData, isEdit = false }) => {
  const [formData, setFormData] = useState<ResourceFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && id) {
        await updateResource(id, formData);
        toast.success('Resource updated successfully');
      } else {
        await createResource(formData);
        toast.success('Resource created successfully');
      }
      
      await queryClient.invalidateQueries('resources');
      navigate('/resources');
    } catch (err) {
      toast.error(isEdit ? 'Failed to update resource' : 'Failed to create resource');
      console.error('Form submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Resource' : 'Create New Resource'}
      </h2>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-white mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-white mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
