import type { VivusProject } from "./lib/projects/projectRegistry";

export type AppProjectRecord = {
  id: string;
  name: string;
  originalPrompt: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "draft";
};

function toIsoDate(value: number) {
  return new Date(value || Date.now()).toISOString();
}

export function workspaceProjectToAppRecord(project: VivusProject): AppProjectRecord {
  return {
    id: project.id,
    name: project.name,
    originalPrompt: `Workspace root: ${project.rootPath}`,
    createdAt: toIsoDate(project.createdAt),
    updatedAt: toIsoDate(project.updatedAt || project.lastOpenedAt),
    status: "active",
  };
}

export function workspaceProjectsToAppRecords(projects: VivusProject[]): AppProjectRecord[] {
  return projects.map(workspaceProjectToAppRecord);
}

export function projectRootFromPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") || trimmed.startsWith("~")) return trimmed;
  return "";
}
