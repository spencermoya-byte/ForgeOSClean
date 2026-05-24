import { isActionAllowed } from './permissionSafetyLayer';

export type TerminalGuardResult = {
  allowed: boolean;
  reason: string;
};

const HIGH_RISK_PATTERNS = [
  /rm\s+-rf/i,
  /del\s+\/f/i,
  /format\s+/i,
  /git\s+reset\s+--hard/i,
  /npm\s+uninstall/i,
];

export function validateTerminalCommand(
  autonomy: 'light' | 'medium' | 'full',
  command: string,
): TerminalGuardResult {
  const terminalAllowed = isActionAllowed(
    autonomy,
    'terminal-command',
  );

  if (!terminalAllowed) {
    return {
      allowed: false,
      reason: 'Terminal access blocked by autonomy settings.',
    };
  }

  const risky = HIGH_RISK_PATTERNS.some((pattern) =>
    pattern.test(command),
  );

  if (risky) {
    return {
      allowed: false,
      reason: 'Blocked potentially destructive terminal command.',
    };
  }

  return {
    allowed: true,
    reason: 'Command allowed.',
  };
}
