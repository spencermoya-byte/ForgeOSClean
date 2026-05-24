const STORAGE_KEY = "vivus.routeRecovery.v1";

export type RouteRecovery = {
  projectPath: string;
  lastRoute: string;
  updatedAt: string;
};

function readItems(): RouteRecovery[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: RouteRecovery[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function saveRoute(projectPath: string, route: string) {
  const items = readItems().filter((item) => item.projectPath !== projectPath);

  writeItems([
    {
      projectPath,
      lastRoute: route,
      updatedAt: new Date().toISOString(),
    },
    ...items,
  ]);
}

export function getSavedRoute(projectPath: string) {
  return readItems().find((item) => item.projectPath === projectPath)?.lastRoute;
}
