import { recallRelevantMemory } from './localMemorySystem';

export function buildMemoryContext(
  request: string,
) {
  const memories = recallRelevantMemory(request);

  if (!memories.length) {
    return 'No relevant local memory found.';
  }

  return memories
    .map(
      (memory) =>
        `[${memory.category}] ${memory.summary}\n${memory.content}`,
    )
    .join('\n\n');
}
