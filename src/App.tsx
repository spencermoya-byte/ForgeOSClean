import React from "react";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar/Navigation Placeholder */}
      <aside className="w-64 p-4 border-r border-gray-800">
        <nav>
          <ul>
            <li className="mb-2">Dashboard</li>
            <li className="mb-2">Tasks</li>
            <li className="mb-2">Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Workspace Placeholder */}
      <main className="flex-grow p-4">
        <Header />
        <div className="mt-8">
          <h2>Welcome to ForgeOS</h2>
          <p>This is the main workspace.</p>
        </div>
      </main>
    </div>
  );
}

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <h1 className="text-xl font-bold">ForgeOS</h1>
      {/* Placeholder for user profile or other actions */}
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded">Profile</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
      </div>
    </header>
  );
};

export default App;
