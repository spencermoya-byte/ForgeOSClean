import { buildMemoryContext } from './contextMemoryBridge';

export function buildPlannerContext(
  request: string,
) {
  const memory = buildMemoryContext(request);

  return [
    'Vivus Memory Context:',
    memory,
    '',
    'Current Request:',
    request,
  ].join('\n');
}
