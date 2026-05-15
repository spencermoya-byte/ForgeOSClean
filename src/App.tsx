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
import WorkspaceList from './features/workspace/WorkspaceList';
import CreateWorkspace from './features/workspace/CreateWorkspace';
import AiChat from './features/ai/AiChat';
import AiSettings from './features/ai/AiSettings';
import MarketplaceDashboard from './features/marketplace/MarketplaceDashboard';
import PluginList from './features/plugin/PluginList';
import WorkflowList from './features/workflow/WorkflowList';
import WorkflowDetail from './features/workflow/WorkflowDetail';

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
              <Route path="/resources" element={<ResourceList />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources/new" element={<CreateResource />} />
              <Route path="/resources/:id/edit" element={<EditResource />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/workspaces" element={<WorkspaceList />} />
              <Route path="/workspaces/new" element={<CreateWorkspace />} />
              <Route path="/ai/chat" element={<AiChat />} />
              <Route path="/ai/settings" element={<AiSettings />} />
              <Route path="/marketplace" element={<MarketplaceDashboard />} />
              <Route path="/plugins" element={<PluginList />} />
              <Route path="/workflows" element={<WorkflowList />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
