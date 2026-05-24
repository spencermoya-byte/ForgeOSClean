export type WorkspaceTab = {
  id: string;
  path: string;
  dirty: boolean;
};

let tabs: WorkspaceTab[] = [];
let activeTabId: string | null = null;

export function openWorkspaceTab(path: string) {
  const existing = tabs.find((t) => t.path === path);

  if (existing) {
    activeTabId = existing.id;
    return existing;
  }

  const tab: WorkspaceTab = {
    id: `tab-${Date.now()}`,
    path,
    dirty: false,
  };

  tabs.push(tab);
  activeTabId = tab.id;

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-tabs', {
      detail: { tabs, activeTabId },
    }),
  );

  return tab;
}

export function getWorkspaceTabs() {
  return { tabs, activeTabId };
}
