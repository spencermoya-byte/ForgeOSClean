export type AutonomyMode = 'light' | 'medium' | 'full';

export type AutonomyPolicy = {
  mode: AutonomyMode;
  requiresApproval: boolean;
  maxFileEdits: number;
  terminalAccess: 'blocked' | 'restricted' | 'allowed';
  packageInstall: 'blocked' | 'approval' | 'allowed';
  checkpointFrequency: 'high' | 'medium' | 'low';
  description: string;
};

export function getAutonomyPolicy(mode: AutonomyMode): AutonomyPolicy {
  switch (mode) {
    case 'light':
      return {
        mode,
        requiresApproval: true,
        maxFileEdits: 3,
        terminalAccess: 'restricted',
        packageInstall: 'blocked',
        checkpointFrequency: 'high',
        description: 'Frequent approvals and minimal safe edits.',
      };
    case 'full':
      return {
        mode,
        requiresApproval: false,
        maxFileEdits: 25,
        terminalAccess: 'allowed',
        packageInstall: 'approval',
        checkpointFrequency: 'low',
        description: 'Large scoped execution with safety guardrails.',
      };
    default:
      return {
        mode,
        requiresApproval: true,
        maxFileEdits: 10,
        terminalAccess: 'restricted',
        packageInstall: 'approval',
        checkpointFrequency: 'medium',
        description: 'Balanced autonomy with periodic checkpoints.',
      };
  }
}
