export type TerminalStreamChunk = {
  id: string;
  sessionId: string;
  projectPath: string;
  source: "stdout" | "stderr" | "system";
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "vivus.terminalStreaming.v1";
const MAX_CHUNKS = 1000;

function readChunks(): TerminalStreamChunk[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeChunks(chunks: TerminalStreamChunk[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chunks.slice(0, MAX_CHUNKS)));
  } catch {}
}

export function appendTerminalStream(sessionId: string, projectPath: string, source: TerminalStreamChunk["source"], text: string) {
  const chunk: TerminalStreamChunk = {
    id: `terminal-stream-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    sessionId,
    projectPath,
    source,
    text,
    createdAt: new Date().toISOString(),
  };

  writeChunks([chunk, ...readChunks()]);
  return chunk;
}

export function listTerminalStream(sessionId: string) {
  return readChunks()
    .filter((chunk) => chunk.sessionId === sessionId)
    .reverse();
}

export function clearTerminalStream(sessionId: string) {
  writeChunks(readChunks().filter((chunk) => chunk.sessionId !== sessionId));
}
