import type { ExecutionPolicyReport } from './executionPolicy';

export type ExecutionTransparencyEvent = {
  id: string;
  label: string;
  detail: string;
  status: 'pending' | 'active' | 'done' | 'blocked';
  createdAt: string;
};

const STORAGE_KEY = 'vivus.executionTransparency.v1';

function readEvents(): ExecutionTransparencyEvent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: ExecutionTransparencyEvent[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 100)));
  } catch {}
}

export function recordExecutionTransparencyEvent(
  label: string,
  detail: string,
  status: ExecutionTransparencyEvent['status'] = 'active'
) {
  const event: ExecutionTransparencyEvent = {
    id: `execution-transparency-${Date.now()}`,
    label,
    detail,
    status,
    createdAt: new Date().toISOString(),
  };

  writeEvents([event, ...readEvents()]);
  window.dispatchEvent(new CustomEvent('vivus-execution-transparency-updated', { detail: event }));
  return event;
}

export function recordPolicyTransparency(report: ExecutionPolicyReport) {
  recordExecutionTransparencyEvent(
    'Execution policy generated',
    `${report.autonomyMode} autonomy selected. ${report.blocked.length} blocked, ${report.approvalRequired.length} approval-required.`,
    report.blocked.length ? 'blocked' : 'done'
  );
}

export function listExecutionTransparencyEvents() {
  return readEvents();
}
