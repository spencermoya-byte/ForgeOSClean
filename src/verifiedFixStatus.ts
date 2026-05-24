export type VerifiedFixState =
  | 'unverified'
  | 'verifying'
  | 'verified'
  | 'failed';

export type VerifiedFixResult = {
  state: VerifiedFixState;
  confidence: number;
  summary: string;
  timestamp: number;
};

let latestFix: VerifiedFixResult = {
  state: 'unverified',
  confidence: 0,
  summary: 'No verification run yet.',
  timestamp: Date.now(),
};

export function updateVerifiedFixStatus(
  result: VerifiedFixResult,
) {
  latestFix = result;

  window.dispatchEvent(
    new CustomEvent('vivus-verified-fix', {
      detail: latestFix,
    }),
  );

  return latestFix;
}

export function getVerifiedFixStatus() {
  return latestFix;
}
