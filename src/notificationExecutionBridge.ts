import { pushNotification } from './notificationCenterState';
import { getVerifiedFixStatus } from './verifiedFixStatus';

export function notifyExecutionResult() {
  const status = getVerifiedFixStatus();

  pushNotification(
    status.state === 'verified'
      ? 'Execution Verified'
      : 'Execution Failed',
    status.summary,
    status.state === 'verified'
      ? 'success'
      : 'error',
  );
}
