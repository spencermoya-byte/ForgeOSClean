let tabSwitchTimer: number | null = null;

function setTabSwitching(value: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("vivus-tab-switching", value);
}

function markTabSwitching() {
  if (typeof window === "undefined") return;

  setTabSwitching(true);

  if (tabSwitchTimer !== null) {
    window.clearTimeout(tabSwitchTimer);
  }

  tabSwitchTimer = window.setTimeout(() => {
    setTabSwitching(false);
    tabSwitchTimer = null;
  }, 180);
}

export function startWorkspaceTabPerformanceRuntime() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".workspace-dock") || target.closest(".plugin-launcher") || target.closest(".project-switcher-menu")) {
        markTabSwitching();
      }
    },
    { passive: true },
  );
}
