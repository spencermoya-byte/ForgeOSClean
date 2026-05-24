export type MultiFileCandidate = {
  relativePath: string;
  reason: string;
  confidence: number;
};

const RELATED_FILE_RULES = [
  {
    match: /(ui|layout|spacing|button|header|preview|dock|composer)/i,
    files: ['src/App.tsx', 'src/App.css'],
  },
  {
    match: /(verification|repair|rollback|patch|diff)/i,
    files: ['src/vivusExecutionLoop.ts'],
  },
  {
    match: /(ollama|model|planner|coder|vision|routing)/i,
    files: ['src/builderOllama.ts', 'src/builderPlanner.ts'],
  },
  {
    match: /(preview|iframe|localhost|dev server)/i,
    files: ['src/livePreviewInstaller.ts'],
  },
];

export function inferMultiFileTargets(
  request: string,
): MultiFileCandidate[] {
  const matches: MultiFileCandidate[] = [];

  for (const rule of RELATED_FILE_RULES) {
    if (!rule.match.test(request)) continue;

    for (const file of rule.files) {
      matches.push({
        relativePath: file,
        reason: 'Matched request category',
        confidence: 0.8,
      });
    }
  }

  const deduped = new Map();

  for (const match of matches) {
    if (!deduped.has(match.relativePath)) {
      deduped.set(match.relativePath, match);
    }
  }

  return Array.from(deduped.values());
}
