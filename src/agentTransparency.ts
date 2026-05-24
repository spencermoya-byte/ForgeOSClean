export type AgentStage =
  | 'planning'
  | 'targeting'
  | 'editing'
  | 'verifying'
  | 'repairing'
  | 'rollback'
  | 'complete';

export type AgentStatus = {
  currentTask: string;
  stage: AgentStage;
  confidence: number;
  elapsedMs: number;
  changedFiles: string[];
};

let activeStatus: AgentStatus = {
  currentTask: 'Idle',
  stage: 'complete',
  confidence: 1,
  elapsedMs: 0,
  changedFiles: [],
};

export function updateAgentTransparency(
  update: Partial<AgentStatus>,
) {
  activeStatus = {
    ...activeStatus,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-agent-status', {
      detail: activeStatus,
    }),
  );
}

export function getAgentTransparency() {
  return activeStatus;
}
