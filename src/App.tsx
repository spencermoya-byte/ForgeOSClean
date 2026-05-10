import React from 'react';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-4">
        <h2 className="text-2xl font-bold">Welcome to ForgeOS</h2>
        <p>This is the workspace area.</p>
      </div>
    </MainLayout>
  );
};

export default App;
