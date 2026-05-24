export type VivusAutonomyLevel = 'light' | 'medium' | 'full';

export type AutonomyPermissions = {
  fileCreation: boolean;
  packageInstall: boolean;
  terminal: boolean;
  destructiveChanges: boolean;
};

export function getAutonomyPermissions(
  level: VivusAutonomyLevel,
): AutonomyPermissions {
  switch (level) {
    case 'light':
      return {
        fileCreation: true,
        packageInstall: false,
        terminal: false,
        destructiveChanges: false,
      };

    case 'medium':
      return {
        fileCreation: true,
        packageInstall: true,
        terminal: true,
        destructiveChanges: false,
      };

    case 'full':
      return {
        fileCreation: true,
        packageInstall: true,
        terminal: true,
        destructiveChanges: false,
      };
  }
}
