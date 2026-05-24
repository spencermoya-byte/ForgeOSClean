export type AiRoleId = 'planner' | 'coder' | 'vision' | 'verifier' | 'repair' | 'summarizer';

export type AiRole = {
  id: AiRoleId;
  label: string;
  description: string;
  preferredModelHints: string[];
  maxContextTokens: number;
  requiresVision: boolean;
  requiresCodeContext: boolean;
};

export const AI_ROLES: AiRole[] = [
  {
    id: 'planner',
    label: 'Planner / Architect',
    description: 'Turns user intent into scoped implementation plans and acceptance criteria.',
    preferredModelHints: ['qwen3.6:27b', 'qwen3:32b', 'qwen3-coder-next', 'qwen3-coder:30b'],
    maxContextTokens: 32768,
    requiresVision: false,
    requiresCodeContext: true,
  },
  {
    id: 'coder',
    label: 'Coder',
    description: 'Generates code patches inside the approved scope.',
    preferredModelHints: ['qwen3-coder-next', 'qwen3-coder:30b', 'qwen2.5-coder:32b'],
    maxContextTokens: 32768,
    requiresVision: false,
    requiresCodeContext: true,
  },
  {
    id: 'vision',
    label: 'Vision Inspector',
    description: 'Analyzes screenshots, UI markup, photos, diagrams, and visual bug reports.',
    preferredModelHints: ['qwen3-vl:32b', 'llava:13b'],
    maxContextTokens: 16384,
    requiresVision: true,
    requiresCodeContext: false,
  },
  {
    id: 'verifier',
    label: 'Verifier',
    description: 'Checks build results, acceptance criteria, and regression risk before success is claimed.',
    preferredModelHints: ['qwen3.6:27b', 'qwen3:32b', 'qwen3-coder:30b'],
    maxContextTokens: 16384,
    requiresVision: false,
    requiresCodeContext: true,
  },
  {
    id: 'repair',
    label: 'Repair Agent',
    description: 'Produces narrow fixes for diagnostics after verification fails.',
    preferredModelHints: ['qwen3-coder:30b', 'qwen3-coder-next', 'qwen2.5-coder:32b'],
    maxContextTokens: 24576,
    requiresVision: false,
    requiresCodeContext: true,
  },
  {
    id: 'summarizer',
    label: 'Summarizer',
    description: 'Compresses logs, diffs, and project history into reusable context.',
    preferredModelHints: ['qwen3:32b', 'qwen3.6:27b', 'qwen3-coder:30b'],
    maxContextTokens: 8192,
    requiresVision: false,
    requiresCodeContext: false,
  },
];

export function getAiRole(roleId: AiRoleId) {
  return AI_ROLES.find((role) => role.id === roleId);
}
