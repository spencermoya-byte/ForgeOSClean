import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import './workspaceSticky.css';
import './commitsLayout.css';
import './executionPolicyStyles.css';
import './workspaceUtilityRail.css';
import './vivusResponsiveFix.css';
import { AppErrorBoundary } from './appErrorBoundary';
import { WorkspaceAwareApp } from './WorkspaceAwareApp';
import { startLegacyWorkspaceBridge } from './legacyWorkspaceBridge';
import { startLivePreviewInstaller } from './livePreviewInstaller';
import { startTerminalWorkflowInstaller } from './terminalWorkflowInstaller';
import { startLocalBuilderInstaller } from './localBuilderInstaller';
import { startExecutionPolicyInstaller } from './executionPolicyInstaller';
import { startWorkspaceUtilityRail } from './workspaceUtilityRail';
import { startWorkspaceRuntimeBridge } from './workspaceRuntimeBridge';

startLegacyWorkspaceBridge();
startWorkspaceRuntimeBridge();
startLivePreviewInstaller();
startTerminalWorkflowInstaller();
startLocalBuilderInstaller();
startExecutionPolicyInstaller();
startWorkspaceUtilityRail();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <WorkspaceAwareApp />
    </AppErrorBoundary>
  </React.StrictMode>
);
