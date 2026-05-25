export type WorkspaceCutoverStatus = {
  cutoverEnabled: boolean;
  appStateDisabled: boolean;
  workspaceOwned: boolean;
};

export function getWorkspaceCutoverStatus(): WorkspaceCutoverStatus {
  if (typeof window === "undefined") {
    return {
      cutoverEnabled: false,
      appStateDisabled: false,
      workspaceOwned: false,
    };
  }

  const target = window as Window & {
    __VIVUS_WORKSPACE_CUTOVER__?: boolean;
    __VIVUS_APP_STATE_DISABLED__?: boolean;
    __VIVUS_WORKSPACE_OWNED__?: boolean;
  };

  return {
    cutoverEnabled: Boolean(target.__VIVUS_WORKSPACE_CUTOVER__),
    appStateDisabled: Boolean(target.__VIVUS_APP_STATE_DISABLED__),
    workspaceOwned: Boolean(target.__VIVUS_WORKSPACE_OWNED__),
  };
}
