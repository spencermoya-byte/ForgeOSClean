import React from "react";
import "./App.css";
import ModalProvider, { useModal } from "./Modal";
import ToastProvider, { useToast } from "./Toast";
import { QueryClient, QueryClientProvider } from 'react-query';
import useUser from './hooks/useUser';

const queryClient = new QueryClient();

function App() {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar/Navigation Placeholder */}
            <aside className="w-64 p-4 border-r border-gray-800 transition-all">
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
                <button onClick={useModal().openModal} className="px-3 py-1 bg-blue-500 text-white rounded mt-4 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all">
                  Open Modal
                </button>
                <button
                  onClick={() => useToast().addToast("This is a toast notification!")}
                  className="px-3 py-1 bg-green-500 text-white rounded mt-4 focus:outline-none focus:ring-2 focus:ring-green-700 transition-all"
                >
                  Show Toast
                </button>
              </div>
            </main>
          </div>
        </ToastProvider>
      </ModalProvider>
    </QueryClientProvider>
  );
}

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 transition-all">
      <h1 className="text-xl font-bold">ForgeOS</h1>
      {/* Placeholder for user profile or other actions */}
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all">Profile</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-700 transition-all">Logout</button>
      </div>
    </header>
  );
};

export default App;
