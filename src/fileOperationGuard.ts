import { isActionAllowed } from './permissionSafetyLayer';

export type FileGuardResult = {
  allowed: boolean;
  reason: string;
};

export function validateFileOperation(
  autonomy: 'light' | 'medium' | 'full',
  operation: 'create' | 'delete' | 'modify',
  relativePath: string,
): FileGuardResult {
  if (
    operation === 'delete' &&
    !isActionAllowed(autonomy, 'file-delete')
  ) {
    return {
      allowed: false,
      reason: 'Deletion blocked by autonomy settings.',
    };
  }

  if (
    operation === 'create' &&
    !isActionAllowed(autonomy, 'file-create')
  ) {
    return {
      allowed: false,
      reason: 'File creation blocked by autonomy settings.',
    };
  }

  const protectedPaths = [
    'package.json',
    'src-tauri/src/lib.rs',
    '.gitignore',
  ];

  const protectedFile = protectedPaths.some((path) =>
    relativePath.includes(path),
  );

  if (protectedFile && autonomy !== 'full') {
    return {
      allowed: false,
      reason:
        'Protected file modification requires full autonomy.',
    };
  }

  return {
    allowed: true,
    reason: 'File operation allowed.',
  };
}
