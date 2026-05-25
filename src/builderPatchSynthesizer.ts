export type PatchEdit = {
  find: string;
  replace: string;
  reason: string;
};

export type PatchSynthesisResult = {
  ok: boolean;
  mode: 'surgical' | 'full-file';
  edits: PatchEdit[];
  reason: string;
};

const SMALL_SCOPE = /(spacing|padding|margin|button|dock|header|responsive|alignment|css|layout|overflow|resize|panel|fix)/i;

export function synthesizePatchPlan(request: string, anchors: string[] = []): PatchSynthesisResult {
  const surgical = SMALL_SCOPE.test(request) && anchors.length > 0;

  if (!surgical) {
    return {
      ok: false,
      mode: 'full-file',
      edits: [],
      reason: 'Request not suitable for surgical patch synthesis.',
    };
  }

  return {
    ok: true,
    mode: 'surgical',
    edits: anchors.slice(0,4).map(anchor => ({
      find: anchor,
      replace: `Modify only logic near: ${anchor}`,
      reason: 'Anchored minimal edit region',
    })),
    reason: `Prepared ${Math.min(anchors.length,4)} surgical edit anchor(s).`,
  };
}
