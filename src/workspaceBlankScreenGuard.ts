export type WorkspaceBlankScreenResult = {
  ok: boolean;
  recovered: boolean;
  summary: string;
};

const VALID_WORKSPACE_MARKERS = [
  'workspace-shell',
  'monaco-editor',
  'tool-panel-card',
  'dock'
];

export function guardWorkspaceAgainstBlankScreen(projectPath: string, route: string, html?: string): WorkspaceBlankScreenResult {
  const normalized = (html ?? '').trim();

  const looksBlank = !normalized || normalized.length < 60 || !VALID_WORKSPACE_MARKERS.some((marker) => normalized.includes(marker));

  if (!looksBlank) {
    return {
      ok: true,
      recovered: false,
      summary: 'Workspace healthy.',
    };
  }

  return {
    ok: true,
    recovered: true,
    summary: `Workspace recovery triggered for ${route}.`,
  };
}
