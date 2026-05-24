import type { PermissionActionKind, PermissionRiskLevel } from './permissionActionEvaluator';

export type PermissionApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type PermissionApprovalRequest = {
  id: string;
  projectPath: string;
  actionKind: PermissionActionKind;
  description: string;
  risk: PermissionRiskLevel;
  reason: string;
  status: PermissionApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.permissionApprovals.v1';
const MAX_APPROVALS = 200;

function readApprovals(): PermissionApprovalRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeApprovals(items: PermissionApprovalRequest[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_APPROVALS)));
  } catch {}
}

export function createPermissionApproval(
  projectPath: string,
  actionKind: PermissionActionKind,
  description: string,
  risk: PermissionRiskLevel,
  reason: string
) {
  const now = new Date().toISOString();
  const request: PermissionApprovalRequest = {
    id: `permission-approval-${Date.now()}`,
    projectPath,
    actionKind,
    description,
    risk,
    reason,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  writeApprovals([request, ...readApprovals()]);
  return request;
}

export function updatePermissionApproval(approvalId: string, status: PermissionApprovalStatus) {
  const now = new Date().toISOString();
  writeApprovals(
    readApprovals().map((item) =>
      item.id === approvalId ? { ...item, status, updatedAt: now } : item
    )
  );
}

export function listPermissionApprovals(projectPath: string) {
  return readApprovals().filter((item) => item.projectPath === projectPath);
}

export function getPermissionApproval(approvalId: string) {
  return readApprovals().find((item) => item.id === approvalId);
}
