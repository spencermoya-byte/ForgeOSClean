export type PreviewRecoveryResult = {
  recovered: boolean;
  action: string;
};

export function recoverPreviewFailure(
  reason: string,
): PreviewRecoveryResult {
  const restartRequired =
    reason.toLowerCase().includes('connection') ||
    reason.toLowerCase().includes('refused');

  return {
    recovered: restartRequired,
    action: restartRequired
      ? 'Restart preview dev server.'
      : 'Retry preview refresh.',
  };
}
