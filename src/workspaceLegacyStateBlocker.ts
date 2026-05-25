function blockLegacyProjectState() {
  if (typeof window === "undefined") return;

  const target = window as Window & {
    __VIVUS_APP_STATE_DISABLED__?: boolean;
  };

  if (!target.__VIVUS_APP_STATE_DISABLED__) return;

  const originalGetItem = window.localStorage.getItem.bind(window.localStorage);

  window.localStorage.getItem = (key: string) => {
    if (
      key === "vivus.projects.v1" ||
      key === "vivus.activeProject.v1" ||
      key === "PROJECT_KEY" ||
      key === "ACTIVE_PROJECT_KEY"
    ) {
      return null;
    }

    return originalGetItem(key);
  };
}

export function startWorkspaceLegacyStateBlocker() {
  if (typeof window === "undefined") return;

  blockLegacyProjectState();
}
