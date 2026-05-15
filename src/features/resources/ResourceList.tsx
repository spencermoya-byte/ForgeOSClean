import React from "react";

interface ResourceItem {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

interface ResourceListProps {
  resources?: ResourceItem[];
  loading?: boolean;
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        No resources found.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">
              {resource.name}
            </h2>

            {resource.type && (
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                {resource.type}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400">
            {resource.description || "No description available."}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;
