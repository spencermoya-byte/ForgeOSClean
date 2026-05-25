import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import './workspaceSticky.css';
import './commitsLayout.css';
import './executionPolicyStyles.css';
import './workspaceUtilityRail.css';
import './vivusResponsiveFix.css';
import './workspaceResponsiveHardening.css';
import { AppErrorBoundary } from './appErrorBoundary';
import { WorkspaceAwareApp } from './WorkspaceAwareApp';
import { bootstrapWorkspaceRuntime } from './workspaceRuntimeBootstrap';
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
import { startWorkspacePreviewAutoRestart } from './workspacePreviewAutoRestart';
import { startWorkspacePreviewCrashMonitor } from './workspacePreviewCrashMonitor';
import { startWorkspacePreviewRuntimeInstaller } from './workspacePreviewRuntimeInstaller';
import { startWorkspacePreviewRuntimeSync } from './workspacePreviewRuntimeSync';
import { startWorkspaceResizePerformanceRuntime } from './workspaceResizePerformance';
import { startWorkspaceRouteRuntimeInstaller } from './workspaceRouteRuntimeInstaller';
import { startWorkspaceRuntimeHealthInstaller } from './workspaceRuntimeHealthInstaller';
import { startWorkspaceRuntimeReadinessInstaller } from './workspaceRuntimeReadinessInstaller';
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
import { startSystemProtectionWatchdog } from './systemProtectionWatchdog';

(window as Window & { __VIVUS_WORKSPACE_OWNED__?: boolean }).__VIVUS_WORKSPACE_OWNED__ = true;

startLegacyWorkspaceBridge();
startWorkspaceRuntimeBridge();
hydrateWorkspaceAppState();
bootstrapWorkspaceRuntime();
startWorkspaceRuntimeGlobals();
startSystemProtectionWatchdog();
startWorkspaceActiveProjectInstaller();
startWorkspaceAppOwnershipRuntime();
startWorkspaceAppOwnershipGuard();
startWorkspaceOwnershipCutoverRuntime();
startWorkspaceLegacyStateBlocker();
startWorkspaceLegacyStateWriteBlocker();
startWorkspaceCutoverVerificationRuntime();
startWorkspaceRuntimeReadinessInstaller();
startWorkspaceRuntimeHealthInstaller();
startWorkspaceSystemRuntimeInstaller();
startWorkspaceRouteRuntimeInstaller();
startWorkspaceBuilderRuntimeInstaller();
startWorkspacePreviewRuntimeInstaller();
startWorkspacePreviewRuntimeSync();
startWorkspacePreviewCrashMonitor();
startWorkspacePreviewAutoRestart();
startWorkspaceResizePerformanceRuntime();
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
