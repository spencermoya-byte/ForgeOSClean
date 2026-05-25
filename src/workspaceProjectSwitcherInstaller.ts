import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { switchWorkspace } from "./workspaceProjectActions";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

function formatProjectDate(value: number) {
  return new Date(value || Date.now()).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderSwitcherMenu(menu: HTMLElement) {
  const snapshot = getWorkspaceSnapshot();
  const activeId = snapshot.activeProject?.id ?? "";

  menu.innerHTML = "";

  const header = document.createElement("div");
  header.className = "project-switcher-header";
  header.textContent = "Workspaces";
  menu.appendChild(header);

  if (snapshot.projects.length === 0) {
    const empty = document.createElement("div");
    empty.className = "project-switcher-empty";
    empty.textContent = "No workspaces yet";
    menu.appendChild(empty);
  } else {
    snapshot.projects.forEach((project) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = project.id === activeId ? "project-switcher-item active" : "project-switcher-item";
      item.setAttribute("data-workspace-project-id", project.id);

      const name = document.createElement("strong");
      name.textContent = project.name;
      const date = document.createElement("span");
      date.textContent = formatProjectDate(project.lastOpenedAt || project.updatedAt);

      item.appendChild(name);
      item.appendChild(date);
      item.addEventListener("click", () => switchWorkspace(project.id));
      menu.appendChild(item);
    });
  }

  const newButton = document.createElement("button");
  newButton.type = "button";
  newButton.className = "project-switcher-new";
  newButton.textContent = "New Workspace";
  newButton.addEventListener("click", () => {
    window.location.hash = "/create";
  });
  menu.appendChild(newButton);
}

function updateSwitcherLabel() {
  const snapshot = getWorkspaceSnapshot();
  const button = document.querySelector<HTMLElement>(".project-switcher-wrap .project-name");
  if (!button) return;

  const icon = button.querySelector("svg")?.outerHTML ?? "";
  button.innerHTML = `${snapshot.activeProject?.name ?? "No Workspace Selected"} ${icon}`;
}

function installWorkspaceProjectSwitcher() {
  if (typeof document === "undefined") return;

  updateSwitcherLabel();
  const menu = document.querySelector<HTMLElement>(".project-switcher-menu");
  if (!menu) return;
  renderSwitcherMenu(menu);
}

export function startWorkspaceProjectSwitcherInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const installSoon = () => window.setTimeout(installWorkspaceProjectSwitcher, 0);
  installSoon();
  subscribeWorkspaceChanged(installSoon);

  const observer = new MutationObserver(installSoon);
  observer.observe(document.body, { childList: true, subtree: true });
}
