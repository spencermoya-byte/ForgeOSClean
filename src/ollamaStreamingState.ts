export type OllamaStreamStatus = 'queued' | 'streaming' | 'complete' | 'failed' | 'cancelled';

export type OllamaStreamChunk = {
  id: string;
  streamId: string;
  text: string;
  createdAt: string;
};

export type OllamaStreamSession = {
  id: string;
  projectPath: string;
  role: string;
  modelName: string;
  promptPreview: string;
  status: OllamaStreamStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

const SESSION_KEY = 'vivus.ollamaStreams.v1';
const CHUNK_KEY = 'vivus.ollamaStreamChunks.v1';

function readSessions(): OllamaStreamSession[] {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(items: OllamaStreamSession[]) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

function readChunks(): OllamaStreamChunk[] {
  try {
    const raw = window.localStorage.getItem(CHUNK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeChunks(items: OllamaStreamChunk[]) {
  try {
    window.localStorage.setItem(CHUNK_KEY, JSON.stringify(items.slice(0, 2000)));
  } catch {}
}

export function createOllamaStreamSession(projectPath: string, role: string, modelName: string, prompt: string) {
  const now = new Date().toISOString();
  const session: OllamaStreamSession = {
    id: `ollama-stream-${Date.now()}`,
    projectPath,
    role,
    modelName,
    promptPreview: prompt.length > 180 ? `${prompt.slice(0, 180)}...` : prompt,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...readSessions()]);
  return session;
}

export function updateOllamaStreamStatus(streamId: string, status: OllamaStreamStatus, error?: string) {
  const now = new Date().toISOString();
  writeSessions(
    readSessions().map((session) =>
      session.id === streamId ? { ...session, status, error, updatedAt: now } : session
    )
  );
}

export function appendOllamaStreamChunk(streamId: string, text: string) {
  const chunk: OllamaStreamChunk = {
    id: `ollama-chunk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    streamId,
    text,
    createdAt: new Date().toISOString(),
  };

  writeChunks([chunk, ...readChunks()]);
  return chunk;
}

export function getOllamaStreamText(streamId: string) {
  return readChunks()
    .filter((chunk) => chunk.streamId === streamId)
    .reverse()
    .map((chunk) => chunk.text)
    .join('');
}

export function listOllamaStreams(projectPath: string) {
  return readSessions().filter((session) => session.projectPath === projectPath);
}
