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
import { startWorkspaceAppsPageInstaller } from './workspaceAppsPageInstaller';
import { startWorkspaceProjectSwitcherInstaller } from './workspaceProjectSwitcherInstaller';
import { startWorkspaceUtilityRail } from './workspaceUtilityRail';
import { hydrateWorkspaceAppState } from './workspaceAppHydrator';
import { startWorkspaceRuntimeBridge } from './workspaceRuntimeBridge';

(window as Window & { __VIVUS_WORKSPACE_OWNED__?: boolean }).__VIVUS_WORKSPACE_OWNED__ = true;

startLegacyWorkspaceBridge();
startWorkspaceRuntimeBridge();
hydrateWorkspaceAppState();
startWorkspaceProjectSwitcherInstaller();
startWorkspaceAppsPageInstaller();
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
