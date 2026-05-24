export type TimelineEvent = {
  id: string;
  timestamp: number;
  category:
    | 'plan'
    | 'edit'
    | 'verify'
    | 'repair'
    | 'rollback';
  detail: string;
};

let events: TimelineEvent[] = [];

export function pushTimelineEvent(
  category: TimelineEvent['category'],
  detail: string,
) {
  const event: TimelineEvent = {
    id: `timeline-${Date.now()}`,
    timestamp: Date.now(),
    category,
    detail,
  };

  events.unshift(event);

  window.dispatchEvent(
    new CustomEvent('vivus-session-timeline', {
      detail: events,
    }),
  );

  return event;
}

export function getSessionTimeline() {
  return events;
}
