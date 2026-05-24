export type VisualChange = {
  id: string;
  type: 'added' | 'removed' | 'modified';
  description: string;
};

export type VisualDiffResult = {
  changed: boolean;
  changes: VisualChange[];
};

export function compareVisualState(
  before: string | null,
  after: string | null,
): VisualDiffResult {
  if (!before || !after) {
    return {
      changed: false,
      changes: [],
    };
  }

  const changed = before !== after;

  return {
    changed,
    changes: changed
      ? [
          {
            id: `change-${Date.now()}`,
            type: 'modified',
            description:
              'Preview output changed between snapshots.',
          },
        ]
      : [],
  };
}
