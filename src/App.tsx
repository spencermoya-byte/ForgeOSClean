import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './auth/authContext';
import ProtectedRoute from './auth/protectedRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';

// Safe placeholder components for routes that may be broken
const MarketplacePlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display the marketplace functionality once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const AiPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">AI</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display AI functionality once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const ProjectsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Projects</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display project management functionality once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const WorkspacesPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Workspaces</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display workspace management functionality once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const ResourcesPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Resources</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display resource management functionality once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const SettingsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
    <p className="text-gray-400 mb-6">This section will display application settings once restored.</p>
    <button 
      onClick={() => window.location.hash = '#/dashboard'}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
    >
      Back to Dashboard
    </button>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<MarketplacePlaceholder />} />
              <Route path="/ai" element={<AiPlaceholder />} />
              <Route path="/projects" element={<ProjectsPlaceholder />} />
              <Route path="/workspaces" element={<WorkspacesPlaceholder />} />
              <Route path="/resources" element={<ResourcesPlaceholder />} />
              <Route path="/settings" element={<SettingsPlaceholder />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
