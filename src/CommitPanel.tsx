import React from "react";
import { Check, GitBranch, MoreHorizontal, RotateCcw } from "lucide-react";
import "./CommitPanelPolish.css";

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

  function requestRollback(commit: CommitEntry) {
    // TODO: Connect this to the future Tauri/Git rollback backend when project snapshots are restorable.
    setStatus(`Rollback requested for: ${commit.message}`);
  }

  return (
    <section className="workspace-content commits-workspace commits-page-polish">
      <div className="commits-panel-card">
        <div className="commits-panel-header">
          <div className="commits-heading">
            <div className="commits-heading-icon">
              <GitBranch size={26} />
            </div>
            <div>
              <h2>Commits</h2>
              <p>Every commit becomes a rollback checkpoint.</p>
            </div>
          </div>

          <label className="github-toggle">
            <input
              type="checkbox"
              checked={autoPush}
              onChange={(event) => setAutoPush(event.target.checked)}
            />
            <span className="github-toggle-track" aria-hidden="true">
              <span className="github-toggle-thumb" />
            </span>
            <span className="github-toggle-copy">
              <strong>GitHub Auto Push</strong>
              <em>{autoPush ? "On until turned off" : "Off"}</em>
            </span>
          </label>
        </div>

        <div className="commit-create-card">
          <div className="commit-create-copy">
            <strong>Create revert point</strong>
            <p>Save the current project state as a local checkpoint. GitHub push will run later when backend Git support is connected.</p>
          </div>

          <div className="commit-controls">
            <input
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="Stable checkpoint"
              aria-label="Commit message"
            />
            <button type="button" className="commit-button" onClick={createCheckpoint} aria-label="Create commit checkpoint" title="Create commit checkpoint">
              <Check size={28} strokeWidth={2.8} />
            </button>
          </div>
        </div>

        <div className="commit-status-line">
          <span className="commit-status-icon">i</span>
          <span>{status}</span>
        </div>

        <div className="commit-history-card">
          <div className="commit-history-header">
            <strong>Recent checkpoints</strong>
            <span>{commits.length} {commits.length === 1 ? "checkpoint" : "checkpoints"}</span>
          </div>

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
                      <div>
                        <strong>{commit.message}</strong>
                        <p>{commit.projectName}</p>
                        <div className="commit-badges">
                          <span>local revert point</span>
                          <span>{commit.status === "github-pending" ? "GitHub push queued" : "GitHub off"}</span>
                        </div>
                      </div>
                      <div className="commit-entry-actions">
                        <span>{formatTime(commit.createdAt)}</span>
                        <button type="button" className="commit-options-button" aria-label="Checkpoint options">
                          <MoreHorizontal size={20} />
                        </button>
                        <button
                          type="button"
                          className="commit-rollback-button"
                          aria-label={`Rollback to ${commit.message}`}
                          title={`Rollback to ${commit.message}`}
                          onClick={() => requestRollback(commit)}
                        >
                          <RotateCcw size={21} strokeWidth={2.4} />
                          <span>Rollback</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
