import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ForgeOS Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Hello, {user?.username || 'User'}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/resources')}
          >
            <h2 className="text-xl font-bold mb-2">Resources</h2>
            <p className="text-gray-300">Manage your application resources</p>
          </div>
          
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/profile')}
          >
            <h2 className="text-xl font-bold mb-2">Profile</h2>
            <p className="text-gray-300">Manage your profile settings</p>
          </div>
          
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/settings')}
          >
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p className="text-gray-300">Configure application settings</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
