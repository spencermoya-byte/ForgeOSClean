import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Safe recovery shell component
const RecoveryShell = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">ForgeOS Recovery Shell</h1>
        <p className="text-green-400 text-center mt-2">React is rendering successfully</p>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Navigation</h2>
          <p className="text-gray-300 mb-4">This is a recovery shell showing that the frontend is working.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="#/dashboard" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Dashboard
            </a>
            <a href="#/marketplace" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Marketplace
            </a>
            <a href="#/ai" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              AI
            </a>
            <a href="#/projects" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Projects
            </a>
            <a href="#/workspaces" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Workspaces
            </a>
            <a href="#/resources" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Resources
            </a>
            <a href="#/settings" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Settings
            </a>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Frontend is running</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>React is rendering</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Features are being restored</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<RecoveryShell />} />
          <Route path="/dashboard" element={<RecoveryShell />} />
          <Route path="/marketplace" element={<RecoveryShell />} />
          <Route path="/ai" element={<RecoveryShell />} />
          <Route path="/projects" element={<RecoveryShell />} />
          <Route path="/workspaces" element={<RecoveryShell />} />
          <Route path="/resources" element={<RecoveryShell />} />
          <Route path="/settings" element={<RecoveryShell />} />
          <Route path="*" element={<RecoveryShell />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
