import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold">ForgeOS Dashboard</h1>
        <p className="text-green-400">Dev Mode Active</p>
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard Placeholder</h2>
        <p className="text-gray-300">This is a placeholder for the dashboard content.</p>
      </div>
    </div>
  );
};

export default Dashboard;
