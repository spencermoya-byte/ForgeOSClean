export type StructuredEditPlan = {
  safe: boolean;
  mode: 'structured-edit' | 'full-file';
  instruction: string;
  reason: string;
};

const SMALL_SCOPE = /(spacing|padding|margin|button|dock|header|responsive|alignment|css|layout|overflow|resize|panel|fix)/i;

export function buildStructuredEditPlan(request: string, anchors: string[] = []): StructuredEditPlan {
  const safe = SMALL_SCOPE.test(request) && anchors.length > 0;

  return safe
    ? {
        safe: true,
        mode: 'structured-edit',
        instruction: `Modify ONLY these anchored regions:\n${anchors.slice(0,5).map(a => `- ${a}`).join('\n')}`,
        reason: `Structured edit mode enabled with ${anchors.length} anchor(s).`,
      }
    : {
        safe: false,
        mode: 'full-file',
        instruction: 'Use minimal safe edits only.',
        reason: 'Structured edit mode unavailable.',
      };
}
