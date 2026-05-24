export type FileWatchEvent = {
  relativePath: string;
  type: 'created' | 'updated' | 'deleted';
  timestamp: number;
};

let recentEvents: FileWatchEvent[] = [];

export function emitFileWatchEvent(
  relativePath: string,
  type: FileWatchEvent['type'],
) {
  const event: FileWatchEvent = {
    relativePath,
    type,
    timestamp: Date.now(),
  };

  recentEvents.unshift(event);
  recentEvents = recentEvents.slice(0, 100);

  window.dispatchEvent(
    new CustomEvent('vivus-file-watch', {
      detail: event,
    }),
  );

  return event;
}

export function getRecentFileWatchEvents() {
  return recentEvents;
}
