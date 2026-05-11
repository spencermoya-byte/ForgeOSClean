import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from '../../services/axios';
import ResourceCard from './ResourceCard';
import { useAuth } from '../../auth/authContext';

const fetchResources = async () => {
  const response = await axios.get('/resources');
  return response.data;
};

const ResourceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: resources, isLoading, isError } = useQuery('resources', fetchResources);
  const { isAuthenticated } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading resources</div>;

  const filteredResources = resources.filter((resource: any) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2>Resource List</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search resources..."
        className="mt-1 block w-full p-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource: any) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div>No resources found</div>
      )}
    </div>
  );
};

export default ResourceList;
