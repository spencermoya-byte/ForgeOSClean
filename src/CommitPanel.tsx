import React from "react";
import { GitBranch } from "lucide-react";

type CommitEntry = {
  id: string;
  message: string;
  createdAt: string;
  projectName: string;
  pushedToGithub: boolean;
  status: "local" | "github-pending" | "github-disabled";
};

const AUTO_PUSH_KEY = "vivus.settings.githubAutoPush.v1";
const COMMITS_KEY = "vivus.commits.v1";

function readAutoPush() {
  return localStorage.getItem(AUTO_PUSH_KEY) === "true";
}

function readCommits(): CommitEntry[] {
  try {
    const raw = localStorage.getItem(COMMITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCommits(commits: CommitEntry[]) {
  localStorage.setItem(COMMITS_KEY, JSON.stringify(commits));
}

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommitPanel({ projectName }: { projectName: string }) {
  const [autoPush, setAutoPush] = React.useState(readAutoPush);
  const [commitMessage, setCommitMessage] = React.useState("Stable checkpoint");
  const [commits, setCommits] = React.useState<CommitEntry[]>(readCommits);
  const [status, setStatus] = React.useState("Ready to create a local revert point.");

  React.useEffect(() => {
    localStorage.setItem(AUTO_PUSH_KEY, String(autoPush));
  }, [autoPush]);

  React.useEffect(() => {
    saveCommits(commits);
  }, [commits]);

  function createCheckpoint() {
    const message = commitMessage.trim() || "Stable checkpoint";
    const now = new Date().toISOString();
    const nextCommit: CommitEntry = {
      id: `checkpoint-${Date.now()}`,
      message,
      createdAt: now,
      projectName: projectName || "Untitled Project",
      pushedToGithub: false,
      status: autoPush ? "github-pending" : "github-disabled",
    };

    setCommits((current) => [nextCommit, ...current]);
    setCommitMessage("Stable checkpoint");
    setStatus(
      autoPush
        ? "Local revert point created. GitHub push is queued for the future Tauri backend."
        : "Local revert point created. GitHub auto-push is off."
    );
  }

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card commits-panel-card">
        <div className="commits-panel-header">
          <div className="tool-panel-heading">
            <GitBranch size={18} />
            <div>
              <h2>Commits</h2>
              <p>Every commit is treated as a rollback checkpoint.</p>
            </div>
          </div>

          <label className="github-toggle">
            <input
              type="checkbox"
              checked={autoPush}
              onChange={(event) => setAutoPush(event.target.checked)}
            />
            <span>
              <strong>GitHub Auto Push</strong>
              <em>{autoPush ? "On until turned off" : "Off"}</em>
            </span>
          </label>
        </div>

        <div className="commit-create-card">
          <div>
            <strong>Create revert point</strong>
            <p>Creates a local checkpoint now. GitHub push will run automatically later when backend Git support is connected.</p>
          </div>

          <div className="commit-controls">
            <input
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="Commit message"
            />
            <button type="button" className="commit-button" onClick={createCheckpoint}>
              Commit
            </button>
          </div>
        </div>

        <div className="commit-status-line">{status}</div>

        <div className="commit-timeline">
          {commits.length === 0 ? (
            <div className="commit-empty-state">
              <strong>No checkpoints yet</strong>
              <p>Create your first commit to make a rollback point.</p>
            </div>
          ) : (
            commits.map((commit) => (
              <article key={commit.id} className="commit-entry">
                <div className="commit-dot" />
                <div className="commit-entry-main">
                  <div className="commit-entry-topline">
                    <strong>{commit.message}</strong>
                    <span>{formatTime(commit.createdAt)}</span>
                  </div>
                  <p>{commit.projectName}</p>
                  <div className="commit-badges">
                    <span>Local revert point</span>
                    <span>{commit.status === "github-pending" ? "GitHub push queued" : "GitHub off"}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
