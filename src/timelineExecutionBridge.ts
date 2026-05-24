import { pushTimelineEvent } from './sessionTimeline';
import { getVerifiedFixStatus } from './verifiedFixStatus';

export function syncExecutionTimeline() {
  const status = getVerifiedFixStatus();

  pushTimelineEvent(
    status.state === 'verified'
      ? 'verify'
      : 'repair',
    status.summary,
  );
}
