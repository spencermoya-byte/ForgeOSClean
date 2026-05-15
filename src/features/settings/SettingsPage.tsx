import React, { useState } from 'react';
import { useAuth } from '../../auth/authContext';

const SettingsPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = async () => {
    await updatePassword(newPassword);
  };

  return (
    <div className="p-4">
      <h2>Settings</h2>
      <form onSubmit={handleUpdatePassword}>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full p-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
