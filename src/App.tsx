import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './auth/authContext';
import ProtectedRoute from './auth/protectedRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import ResourceList from './features/resources/ResourceList';
import ResourceDetail from './features/resources/ResourceDetail';
import CreateResource from './features/resources/CreateResource';
import EditResource from './features/resources/EditResource';
import ProfilePage from './features/profile/ProfilePage';
import SettingsPage from './features/settings/SettingsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resources" element={<ResourceList />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources/new" element={<CreateResource />} />
              <Route path="/resources/:id/edit" element={<EditResource />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
