export type PreviewAnnotationVisionTarget = {
  id: string;
  projectPath: string;
  annotationId: string;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  intent: 'layout-issue' | 'missing-ui' | 'misaligned-ui' | 'visual-bug' | 'unknown';
  visionPrompt: string;
  status: 'queued' | 'inspecting' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.previewAnnotationVisionTargets.v1';

function readTargets(): PreviewAnnotationVisionTarget[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTargets(items: PreviewAnnotationVisionTarget[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 150)));
  } catch {}
}

export function queueAnnotationVisionInspection(
  projectPath: string,
  annotationId: string,
  region: PreviewAnnotationVisionTarget['region'],
  intent: PreviewAnnotationVisionTarget['intent'] = 'unknown'
) {
  const now = new Date().toISOString();
  const target: PreviewAnnotationVisionTarget = {
    id: `annotation-vision-${Date.now()}`,
    projectPath,
    annotationId,
    region,
    intent,
    status: 'queued',
    visionPrompt: `Inspect the marked preview region for a ${intent}. Identify the likely UI component, visible defect, and smallest safe fix target.`,
    createdAt: now,
    updatedAt: now,
  };

  writeTargets([target, ...readTargets()]);
  return target;
}

export function updateAnnotationVisionTarget(
  targetId: string,
  patch: Partial<Omit<PreviewAnnotationVisionTarget, 'id' | 'createdAt'>>
) {
  const now = new Date().toISOString();
  writeTargets(
    readTargets().map((target) =>
      target.id === targetId ? { ...target, ...patch, updatedAt: now } : target
    )
  );
}

export function listAnnotationVisionTargets(projectPath: string) {
  return readTargets().filter((target) => target.projectPath === projectPath);
}
