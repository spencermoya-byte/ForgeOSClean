export type RecentProject = {
  path: string;
  openedAt: number;
};

let recentProjects: RecentProject[] = [];

export function addRecentProject(path: string) {
  recentProjects = [
    {
      path,
      openedAt: Date.now(),
    },
    ...recentProjects.filter((p) => p.path !== path),
  ].slice(0, 20);

  window.dispatchEvent(
    new CustomEvent('vivus-recent-projects', {
      detail: recentProjects,
    }),
  );

  return recentProjects;
}

export function getRecentProjects() {
  return recentProjects;
}
