import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-900 text-white p-4 w-64">
      <nav>
        <ul>
          <li className="mb-2">Dashboard</li>
          <li className="mb-2">Projects</li>
          <li className="mb-2">Settings</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
