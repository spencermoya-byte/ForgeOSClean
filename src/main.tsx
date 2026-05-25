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
import { startWorkspaceActiveProjectInstaller } from './workspaceActiveProjectInstaller';
import { startWorkspaceAppOwnershipGuard } from './workspaceAppOwnershipGuard';
import { startWorkspaceAppOwnershipRuntime } from './workspaceAppOwnershipRuntime';
import { startWorkspaceBuilderRuntimeInstaller } from './workspaceBuilderRuntimeInstaller';
import { startWorkspaceCutoverVerificationRuntime } from './workspaceCutoverVerificationRuntime';
import { startWorkspaceExecutionRuntimeInstaller } from './workspaceExecutionRuntimeInstaller';
import { startWorkspaceFilesRuntimeInstaller } from './workspaceFilesRuntimeInstaller';
import { startWorkspaceLegacyStateBlocker } from './workspaceLegacyStateBlocker';
import { startWorkspaceLegacyStateWriteBlocker } from './workspaceLegacyStateWriteBlocker';
import { startWorkspaceOwnershipCutoverRuntime } from './workspaceOwnershipCutoverRuntime';
import { startWorkspacePreviewRuntimeInstaller } from './workspacePreviewRuntimeInstaller';
import { startWorkspaceRouteRuntimeInstaller } from './workspaceRouteRuntimeInstaller';
import { startWorkspaceSystemRuntimeInstaller } from './workspaceSystemRuntimeInstaller';
import { startWorkspaceTerminalRuntimeInstaller } from './workspaceTerminalRuntimeInstaller';
import { startLegacyWorkspaceBridge } from './legacyWorkspaceBridge';
import { startLivePreviewInstaller } from './livePreviewInstaller';
import { startTerminalWorkflowInstaller } from './terminalWorkflowInstaller';
import { startLocalBuilderInstaller } from './localBuilderInstaller';
import { startExecutionPolicyInstaller } from './executionPolicyInstaller';
import { startWorkspaceAppsPageInstaller } from './workspaceAppsPageInstaller';
import { startWorkspaceCreatePageInstaller } from './workspaceCreatePageInstaller';
import { startWorkspaceProjectSwitcherInstaller } from './workspaceProjectSwitcherInstaller';
import { startWorkspaceRuntimeGlobals } from './workspaceRuntimeGlobals';
import { startWorkspaceUtilityRail } from './workspaceUtilityRail';
import { hydrateWorkspaceAppState } from './workspaceAppHydrator';
import { startWorkspaceRuntimeBridge } from './workspaceRuntimeBridge';

(window as Window & { __VIVUS_WORKSPACE_OWNED__?: boolean }).__VIVUS_WORKSPACE_OWNED__ = true;

startLegacyWorkspaceBridge();
startWorkspaceRuntimeBridge();
hydrateWorkspaceAppState();
startWorkspaceRuntimeGlobals();
startWorkspaceActiveProjectInstaller();
startWorkspaceAppOwnershipRuntime();
startWorkspaceAppOwnershipGuard();
startWorkspaceOwnershipCutoverRuntime();
startWorkspaceLegacyStateBlocker();
startWorkspaceLegacyStateWriteBlocker();
startWorkspaceCutoverVerificationRuntime();
startWorkspaceSystemRuntimeInstaller();
startWorkspaceRouteRuntimeInstaller();
startWorkspaceBuilderRuntimeInstaller();
startWorkspacePreviewRuntimeInstaller();
startWorkspaceExecutionRuntimeInstaller();
startWorkspaceFilesRuntimeInstaller();
startWorkspaceTerminalRuntimeInstaller();
startWorkspaceProjectSwitcherInstaller();
startWorkspaceAppsPageInstaller();
startWorkspaceCreatePageInstaller();
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
