import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ResourceProps {
  resource: any;
}

const ResourceCard: React.FC<ResourceProps> = ({ resource }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold mb-2 text-white">{resource.name}</h3>
      </div>
      <p className="text-gray-300 mb-4 line-clamp-2">{resource.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {new Date(resource.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/resources/${resource.id}`)}
            className="text-blue-400 hover:text-blue-300 transition duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
