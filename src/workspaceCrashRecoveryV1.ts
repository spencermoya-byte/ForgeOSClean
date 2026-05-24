import { recoverWorkspaceRoute } from './workspaceRouteRecovery';
import { saveWorkspaceSession } from './workspaceSessionRestore';
import { updateWorkspaceHealth } from './workspaceHealthState';

export type WorkspaceCrashReport = {
  id: string;
  projectPath: string;
  route: string;
  message: string;
  stack?: string;
  recoveredRoute?: string;
  createdAt: string;
};

const STORAGE_KEY = 'vivus.workspaceCrashReports.v1';

function readReports(): WorkspaceCrashReport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeReports(reports: WorkspaceCrashReport[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 80)));
  } catch {}
}

export function recoverWorkspaceCrash(projectPath: string, route: string, message: string, stack?: string) {
  saveWorkspaceSession({
    projectPath,
    route,
    activePanels: ['editor', 'console', 'preview'],
    activeFiles: [],
  });

  updateWorkspaceHealth(projectPath, route, {
    status: 'degraded',
    failureReason: message,
    lastFailureAt: new Date().toISOString(),
  });

  const recovery = recoverWorkspaceRoute(projectPath, route, message);

  const report: WorkspaceCrashReport = {
    id: `workspace-crash-${Date.now()}`,
    projectPath,
    route,
    message,
    stack,
    recoveredRoute: recovery.recoveredRoute,
    createdAt: new Date().toISOString(),
  };

  writeReports([report, ...readReports()]);
  return report;
}

export function listWorkspaceCrashReports(projectPath: string) {
  return readReports().filter((report) => report.projectPath === projectPath);
}
