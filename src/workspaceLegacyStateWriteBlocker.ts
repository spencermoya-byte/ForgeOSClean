function blockLegacyProjectWrites() {
  if (typeof window === "undefined") return;

  const target = window as Window & {
    __VIVUS_APP_STATE_DISABLED__?: boolean;
  };

  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  window.localStorage.setItem = (key: string, value: string) => {
    if (
      target.__VIVUS_APP_STATE_DISABLED__ &&
      (
        key === "vivus.projects.v1" ||
        key === "vivus.activeProject.v1" ||
        key === "PROJECT_KEY" ||
        key === "ACTIVE_PROJECT_KEY"
      )
    ) {
      return;
    }

    originalSetItem(key, value);
  };

  window.localStorage.removeItem = (key: string) => {
    if (
      target.__VIVUS_APP_STATE_DISABLED__ &&
      (
        key === "vivus.projects.v1" ||
        key === "vivus.activeProject.v1" ||
        key === "PROJECT_KEY" ||
        key === "ACTIVE_PROJECT_KEY"
      )
    ) {
      return;
    }

    originalRemoveItem(key);
  };
}

export function startWorkspaceLegacyStateWriteBlocker() {
  if (typeof window === "undefined") return;

  blockLegacyProjectWrites();
}
