let resizeTimer: number | null = null;

function setResizing(value: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("vivus-is-resizing", value);
}

export function startWorkspaceResizePerformanceRuntime() {
  if (typeof window === "undefined") return;

  window.addEventListener(
    "resize",
    () => {
      setResizing(true);

      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        setResizing(false);
        resizeTimer = null;
      }, 140);
    },
    { passive: true },
  );
}
