import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../../services/axios';

const fetchResource = async (id: string) => {
  const response = await axios.get(`/resources/${id}`);
  return response.data;
};

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: resource, isLoading, isError } = useQuery(['resource', id], () => fetchResource(id));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading resource</div>;

  return (
    <div className="p-4">
      <h2>{resource.name}</h2>
      <p>{resource.description}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default ResourceDetail;
