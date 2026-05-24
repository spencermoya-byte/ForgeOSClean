export type AgentRole =
  | 'planner'
  | 'coder'
  | 'vision'
  | 'verifier'
  | 'repair';

export type AgentConfig = {
  role: AgentRole;
  model: string;
  enabled: boolean;
};

export function getDefaultAgentRoles(): AgentConfig[] {
  return [
    {
      role: 'planner',
      model: 'qwen3.6:27b',
      enabled: true,
    },
    {
      role: 'coder',
      model: 'qwen3-coder:30b',
      enabled: true,
    },
    {
      role: 'vision',
      model: 'qwen3-vl:32b',
      enabled: true,
    },
    {
      role: 'verifier',
      model: 'qwen3-coder:30b',
      enabled: true,
    },
    {
      role: 'repair',
      model: 'qwen3-coder:30b',
      enabled: true,
    },
  ];
}
