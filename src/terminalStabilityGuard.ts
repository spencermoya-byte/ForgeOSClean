export type TerminalStabilityIssue = {
  id: string;
  projectPath: string;
  sessionId?: string;
  severity: "info" | "warning" | "error";
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "vivus.terminalStability.v1";
const MAX_ISSUES = 80;

function readIssues(): TerminalStabilityIssue[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIssues(issues: TerminalStabilityIssue[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issues.slice(0, MAX_ISSUES)));
  } catch {}
}

export function recordTerminalIssue(
  projectPath: string,
  message: string,
  severity: TerminalStabilityIssue["severity"] = "warning",
  sessionId?: string
) {
  const issue: TerminalStabilityIssue = {
    id: `terminal-issue-${Date.now()}`,
    projectPath,
    sessionId,
    severity,
    message,
    createdAt: new Date().toISOString(),
  };

  writeIssues([issue, ...readIssues()]);
  return issue;
}

export function listTerminalIssues(projectPath: string) {
  return readIssues().filter((issue) => issue.projectPath === projectPath);
}

export function clearTerminalIssues(projectPath: string) {
  writeIssues(readIssues().filter((issue) => issue.projectPath !== projectPath));
}

export function validateTerminalProjectPath(projectPath: string) {
  const trimmed = projectPath.trim();
  if (!trimmed) return "Project path is empty.";
  if (trimmed.length < 3) return "Project path is too short.";
  return undefined;
}
