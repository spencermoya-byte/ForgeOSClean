export type BuildStatus = {
  running: boolean;
  success: boolean | null;
  startedAt: number | null;
  finishedAt: number | null;
  errorCount: number;
};

let state: BuildStatus = {
  running: false,
  success: null,
  startedAt: null,
  finishedAt: null,
  errorCount: 0,
};

export function updateBuildStatus(
  update: Partial<BuildStatus>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-build-status', {
      detail: state,
    }),
  );

  return state;
}

export function getBuildStatus() {
  return state;
}
