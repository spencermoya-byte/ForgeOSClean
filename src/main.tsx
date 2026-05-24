import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import './workspaceSticky.css';
import './commitsLayout.css';
import './executionPolicyStyles.css';
import './pluginManager.css';
import './pluginDock.css';
import './workspaceUtilityRail.css';
import { AppErrorBoundary } from './appErrorBoundary';
import { startLivePreviewInstaller } from './livePreviewInstaller';
import { startTerminalWorkflowInstaller } from './terminalWorkflowInstaller';
import { startLocalBuilderInstaller } from './localBuilderInstaller';
import { startExecutionPolicyInstaller } from './executionPolicyInstaller';
import { startPluginManagerInstaller } from './pluginManagerInstaller';
import { startPluginDockInstaller } from './pluginDockInstaller';
import { startWorkspaceUtilityRail } from './workspaceUtilityRail';

startLivePreviewInstaller();
startTerminalWorkflowInstaller();
startLocalBuilderInstaller();
startExecutionPolicyInstaller();
startPluginManagerInstaller();
startPluginDockInstaller();
startWorkspaceUtilityRail();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
