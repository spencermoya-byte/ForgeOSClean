export type VerifiedFixPipelineStatus =
  | 'created'
  | 'reproducing'
  | 'planning'
  | 'patching'
  | 'verifying'
  | 'repairing'
  | 'verified-fixed'
  | 'rolled-back'
  | 'blocked';

export type VerifiedFixPipeline = {
  id: string;
  projectPath: string;
  task: string;
  status: VerifiedFixPipelineStatus;
  reproductionSteps: string[];
  acceptanceCriteria: string[];
  proof: string[];
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.verifiedFixPipeline.v1';
const MAX_PIPELINES = 120;

function readPipelines(): VerifiedFixPipeline[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePipelines(items: VerifiedFixPipeline[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_PIPELINES)));
  } catch {}
}

export function createVerifiedFixPipeline(projectPath: string, task: string, acceptanceCriteria: string[] = []) {
  const now = new Date().toISOString();
  const pipeline: VerifiedFixPipeline = {
    id: `verified-pipeline-${Date.now()}`,
    projectPath,
    task,
    status: 'created',
    reproductionSteps: [],
    acceptanceCriteria,
    proof: [],
    createdAt: now,
    updatedAt: now,
  };

  writePipelines([pipeline, ...readPipelines()]);
  return pipeline;
}

export function updateVerifiedFixPipeline(pipelineId: string, patch: Partial<Omit<VerifiedFixPipeline, 'id' | 'createdAt'>>) {
  const now = new Date().toISOString();
  writePipelines(
    readPipelines().map((pipeline) =>
      pipeline.id === pipelineId
        ? { ...pipeline, ...patch, updatedAt: now }
        : pipeline
    )
  );
}

export function getVerifiedFixPipeline(pipelineId: string) {
  return readPipelines().find((pipeline) => pipeline.id === pipelineId);
}

export function listVerifiedFixPipelines(projectPath: string) {
  return readPipelines().filter((pipeline) => pipeline.projectPath === projectPath);
}
