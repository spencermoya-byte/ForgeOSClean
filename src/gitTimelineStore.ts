export type GitTimelineEntry = {
  id: string;
  projectPath: string;
  type: "checkpoint" | "commit" | "rollback" | "builder-change";
  title: string;
  detail?: string;
  files?: string[];
  createdAt: string;
};

const STORAGE_KEY = "vivus.gitTimeline.v1";
const MAX_ENTRIES = 250;

function readTimeline(): GitTimelineEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTimeline(entries: GitTimelineEntry[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES))
    );
  } catch {}
}

export function listGitTimeline(projectPath: string) {
  return readTimeline().filter(
    (entry) => entry.projectPath === projectPath
  );
}

export function addGitTimelineEntry(
  entry: Omit<GitTimelineEntry, "id" | "createdAt">
) {
  const next: GitTimelineEntry = {
    ...entry,
    id: `timeline-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  writeTimeline([next, ...readTimeline()]);
  return next;
}
