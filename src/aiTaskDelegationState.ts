import type { AiRoleId } from './aiOrchestrationRoles';

export type AiDelegationStatus = 'queued' | 'running' | 'blocked' | 'complete' | 'failed';

export type AiDelegatedTask = {
  id: string;
  title: string;
  projectPath: string;
  role: AiRoleId;
  status: AiDelegationStatus;
  dependsOnTaskIds: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.aiDelegation.v1';

function readTasks(): AiDelegatedTask[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTasks(tasks: AiDelegatedTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.slice(0, 200)));
  } catch {}
}

export function createAiDelegatedTask(projectPath: string, role: AiRoleId, title: string, acceptanceCriteria: string[] = [], dependsOnTaskIds: string[] = []) {
  const now = new Date().toISOString();

  const task: AiDelegatedTask = {
    id: `ai-task-${Date.now()}`,
    title,
    projectPath,
    role,
    status: 'queued',
    dependsOnTaskIds,
    acceptanceCriteria,
    createdAt: now,
    updatedAt: now,
  };

  writeTasks([task, ...readTasks()]);
  return task;
}

export function updateAiTaskStatus(taskId: string, status: AiDelegationStatus) {
  const now = new Date().toISOString();

  writeTasks(readTasks().map((task) => task.id === taskId ? { ...task, status, updatedAt: now } : task));
}

export function listAiTasks(projectPath: string) {
  return readTasks().filter((task) => task.projectPath === projectPath);
}
