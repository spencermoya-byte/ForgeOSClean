import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4">
        <Header />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
