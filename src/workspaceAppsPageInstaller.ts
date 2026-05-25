import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { switchWorkspace } from "./workspaceProjectActions";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

function shortDate(value: number) {
  return new Date(value || Date.now()).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderWorkspaceProjectCard(project: ReturnType<typeof getWorkspaceSnapshot>["projects"][number]) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "project-card";

  const topline = document.createElement("div");
  topline.className = "project-card-topline";

  const status = document.createElement("span");
  status.textContent = "active";
  const date = document.createElement("em");
  date.textContent = shortDate(project.lastOpenedAt || project.updatedAt);

  topline.appendChild(status);
  topline.appendChild(date);

  const title = document.createElement("h2");
  title.textContent = project.name;

  const root = document.createElement("p");
  root.textContent = project.rootPath;

  card.appendChild(topline);
  card.appendChild(title);
  card.appendChild(root);
  card.addEventListener("click", () => {
    switchWorkspace(project.id);
    window.location.hash = "/workspace";
  });

  return card;
}

function installWorkspaceAppsPage() {
  if (typeof document === "undefined") return;

  const projectList = document.querySelector<HTMLElement>(".project-list");
  if (!projectList) return;

  const snapshot = getWorkspaceSnapshot();
  if (snapshot.projects.length === 0) return;

  projectList.innerHTML = "";
  snapshot.projects.forEach((project) => {
    projectList.appendChild(renderWorkspaceProjectCard(project));
  });
}

export function startWorkspaceAppsPageInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const installSoon = () => window.setTimeout(installWorkspaceAppsPage, 0);
  installSoon();
  subscribeWorkspaceChanged(installSoon);

  const observer = new MutationObserver(installSoon);
  observer.observe(document.body, { childList: true, subtree: true });
}
