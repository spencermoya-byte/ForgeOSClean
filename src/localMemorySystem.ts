export type MemoryEntry = {
  id: string;
  createdAt: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
};

const MEMORY_STORAGE_KEY = 'vivus.local.memory.v1';

function readMemory(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemory(entries: MemoryEntry[]) {
  localStorage.setItem(
    MEMORY_STORAGE_KEY,
    JSON.stringify(entries),
  );
}

export function rememberContext(
  category: string,
  summary: string,
  content: string,
  tags: string[] = [],
) {
  const entries = readMemory();

  entries.unshift({
    id: `memory-${Date.now()}`,
    createdAt: new Date().toISOString(),
    category,
    summary,
    content,
    tags,
  });

  saveMemory(entries.slice(0, 250));
}

export function recallRelevantMemory(
  query: string,
): MemoryEntry[] {
  const lower = query.toLowerCase();

  return readMemory()
    .filter((entry) => {
      const searchable = [
        entry.category,
        entry.summary,
        entry.content,
        ...entry.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(lower);
    })
    .slice(0, 12);
}
