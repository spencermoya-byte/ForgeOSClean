export type AiGuardrailRuleId =
  | 'absolute-task-lock'
  | 'minimal-patch'
  | 'active-source-verification'
  | 'verification-required'
  | 'no-unrelated-edits'
  | 'anti-loop';

export type AiGuardrailRule = {
  id: AiGuardrailRuleId;
  label: string;
  description: string;
  enabled: boolean;
  severity: 'warning' | 'blocking';
};

export const DEFAULT_AI_GUARDRAILS: AiGuardrailRule[] = [
  {
    id: 'absolute-task-lock',
    label: 'Absolute Task Lock',
    description: 'AI must only work on the explicitly approved task scope.',
    enabled: true,
    severity: 'blocking',
  },
  {
    id: 'minimal-patch',
    label: 'Minimal Patch Strategy',
    description: 'AI should prefer the smallest safe change that solves the issue.',
    enabled: true,
    severity: 'warning',
  },
  {
    id: 'active-source-verification',
    label: 'Active Source Verification',
    description: 'AI must verify correct files before changes are proposed.',
    enabled: true,
    severity: 'blocking',
  },
  {
    id: 'verification-required',
    label: 'Verification Required',
    description: 'Build/test verification required before success can be claimed.',
    enabled: true,
    severity: 'blocking',
  },
  {
    id: 'no-unrelated-edits',
    label: 'No Unrelated Edits',
    description: 'Prevent collateral modifications outside approved scope.',
    enabled: true,
    severity: 'blocking',
  },
  {
    id: 'anti-loop',
    label: 'Anti-loop Protection',
    description: 'Stop repeated ineffective fixes and escalate to repair routing.',
    enabled: true,
    severity: 'blocking',
  },
];

export function listAiGuardrails() {
  return DEFAULT_AI_GUARDRAILS;
}

export function getAiGuardrail(ruleId: AiGuardrailRuleId) {
  return DEFAULT_AI_GUARDRAILS.find((rule) => rule.id === ruleId);
}
