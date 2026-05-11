import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import ResourceForm from './ResourceForm';
import { getResource } from '../../api/resource';

const fetchResource = async (id: string) => {
  const resource = await getResource(id);
  return resource;
};

const EditResource: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: resource, isLoading, isError } = useQuery(['resource', id], () => fetchResource(id));

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-24 bg-gray-700 rounded w-full mb-6"></div>
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="p-4">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">
          Error loading resource
        </div>
      </div>
    );
  }

  return <ResourceForm initialData={resource} isEdit={true} />;
};

export default EditResource;
