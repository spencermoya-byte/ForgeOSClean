import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ResourceProps {
  resource: any;
}

const ResourceCard: React.FC<ResourceProps> = ({ resource }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">{resource.name}</h3>
      <p>{resource.description}</p>
      <button
        onClick={() => navigate(`/resources/${resource.id}`)}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        View Details
      </button>
    </div>
  );
};

export default ResourceCard;
