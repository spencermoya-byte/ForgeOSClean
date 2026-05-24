export type GitTimelineEventType =
  | "checkpoint-created"
  | "builder-change"
  | "rollback"
  | "recovery"
  | "verification"
  | "manual";

export type GitTimelineEvent = {
  id: string;
  projectPath: string;
  type: GitTimelineEventType;
  title: string;
  description?: string;
  relatedCheckpointId?: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
};

const STORAGE_KEY = "vivus.gitTimeline.v1";
const MAX_EVENTS = 250;

function readTimeline(): GitTimelineEvent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTimeline(events: GitTimelineEvent[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events.slice(0, MAX_EVENTS))
    );
  } catch {}
}

export function addGitTimelineEvent(
  projectPath: string,
  type: GitTimelineEventType,
  title: string,
  options?: Partial<Omit<GitTimelineEvent, "id" | "projectPath" | "type" | "title" | "createdAt">>
) {
  const event: GitTimelineEvent = {
    id: `timeline-${Date.now()}`,
    projectPath,
    type,
    title,
    createdAt: new Date().toISOString(),
    ...options,
  };

  writeTimeline([event, ...readTimeline()]);
  return event;
}

export function listGitTimeline(projectPath: string) {
  return readTimeline().filter((event) => event.projectPath === projectPath);
}

export function clearGitTimeline(projectPath: string) {
  writeTimeline(
    readTimeline().filter((event) => event.projectPath !== projectPath)
  );
}
