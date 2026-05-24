export type FileRelationship = {
  source: string;
  target: string;
  reason: string;
};

const graph: FileRelationship[] = [
  {
    source: 'src/App.tsx',
    target: 'src/App.css',
    reason: 'UI styling relationship',
  },
  {
    source: 'src/vivusExecutionLoop.ts',
    target: 'src/builderPlanner.ts',
    reason: 'Execution planning dependency',
  },
  {
    source: 'src/livePreviewInstaller.ts',
    target: 'src/visionVerification.ts',
    reason: 'Preview verification relationship',
  },
];

export function getRelatedFiles(
  relativePath: string,
) {
  return graph.filter(
    (entry) =>
      entry.source === relativePath ||
      entry.target === relativePath,
  );
}
