import React from "react";
import { Check, GitBranch, MoreHorizontal, RotateCcw } from "lucide-react";

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
      <style>{`
        .commits-page-polish .commits-panel-card {
          background:
            radial-gradient(circle at right top, rgba(124, 58, 237, 0.14), transparent 28rem),
            rgba(13, 16, 26, 0.76);
        }

        .commits-page-polish .commits-panel-header {
          min-height: 126px;
          padding: 28px 40px;
        }

        .commits-page-polish .commits-heading {
          gap: 22px;
        }

        .commits-page-polish .commits-heading-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
        }

        .commits-page-polish .commits-heading h2 {
          font-size: 28px;
          line-height: 1.05;
        }

        .commits-page-polish .commits-heading p {
          margin-top: 9px;
          font-size: 15px;
          color: #d4cfe0;
        }

        .commits-page-polish .github-toggle {
          min-width: 282px;
          min-height: 74px;
          padding: 16px 20px;
          gap: 16px;
          border-color: rgba(167, 139, 250, 0.34);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.035);
        }

        .commits-page-polish .github-toggle-track {
          width: 58px;
          height: 32px;
          padding: 4px;
          flex: 0 0 58px;
        }

        .commits-page-polish .github-toggle-thumb {
          width: 22px;
          height: 22px;
        }

        .commits-page-polish .github-toggle input:checked + .github-toggle-track .github-toggle-thumb {
          transform: translateX(26px);
        }

        .commits-page-polish .github-toggle-copy strong {
          font-size: 17px;
          line-height: 1.15;
        }

        .commits-page-polish .github-toggle-copy em {
          margin-top: 4px;
          font-size: 14px;
          color: #d4cfe0;
        }

        .commits-page-polish .commit-create-card {
          margin: 16px 24px 14px;
          padding: 22px 28px;
          min-height: 126px;
          grid-template-columns: minmax(300px, 450px) minmax(300px, 1fr);
          gap: 28px;
        }

        .commits-page-polish .commit-create-copy strong {
          font-size: 17px;
        }

        .commits-page-polish .commit-create-copy p {
          max-width: 380px;
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.55;
          color: #d4cfe0;
        }

        .commits-page-polish .commit-controls input {
          height: 46px;
          padding: 0 18px;
          border-radius: 13px;
          font-size: 15px;
        }

        .commits-page-polish .commit-button {
          width: 64px;
          height: 46px;
          flex-basis: 64px;
          border-radius: 15px;
        }

        .commits-page-polish .commit-status-line {
          margin: 0 24px 14px;
          min-height: 58px;
          padding: 0 28px;
          gap: 16px;
          border-radius: 14px;
          font-size: 15px;
          color: #ede9fe;
        }

        .commits-page-polish .commit-status-icon {
          width: 34px;
          height: 34px;
          font-size: 17px;
        }

        .commits-page-polish .commit-history-card {
          margin: 0 24px 22px;
          border-radius: 17px;
        }

        .commits-page-polish .commit-history-header {
          min-height: 56px;
          padding: 0 26px;
        }

        .commits-page-polish .commit-history-header strong {
          font-size: 18px;
        }

        .commits-page-polish .commit-history-header span {
          padding: 7px 14px;
          font-size: 13px;
        }

        .commits-page-polish .commit-entry {
          min-height: 92px;
          padding: 13px 28px 13px 78px;
          display: flex;
          align-items: center;
        }

        .commits-page-polish .commit-entry::before {
          content: "";
          position: absolute;
          left: 41px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.22), rgba(139, 92, 246, 0.75), rgba(139, 92, 246, 0.22));
        }

        .commits-page-polish .commit-dot {
          left: 32px;
          top: 50%;
          width: 20px;
          height: 20px;
          transform: translateY(-50%);
          box-shadow: 0 0 0 7px rgba(124, 58, 237, 0.18), 0 0 20px rgba(99, 102, 241, 0.5);
          z-index: 1;
        }

        .commits-page-polish .commit-entry-main {
          width: 100%;
          gap: 0;
        }

        .commits-page-polish .commit-entry-topline {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 28px;
        }

        .commits-page-polish .commit-entry-topline strong {
          font-size: 18px;
          line-height: 1.1;
        }

        .commits-page-polish .commit-entry-main p {
          margin-top: 7px;
          font-size: 14px;
          color: #d4cfe0;
        }

        .commits-page-polish .commit-badges {
          margin-top: 10px;
          gap: 9px;
        }

        .commits-page-polish .commit-badges span {
          padding: 5px 12px;
          font-size: 12px;
          line-height: 1;
        }

        .commits-page-polish .commit-entry-actions {
          display: grid;
          grid-template-columns: auto 48px 146px;
          align-items: center;
          gap: 16px;
          font-size: 14px;
          color: #d4cfe0;
        }

        .commits-page-polish .commit-entry-actions > span {
          min-width: 130px;
          text-align: right;
        }

        .commits-page-polish .commit-options-button,
        .commits-page-polish .commit-rollback-button {
          height: 50px;
          border-radius: 13px;
          color: #ede9fe;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }

        .commits-page-polish .commit-options-button {
          width: 48px;
        }

        .commits-page-polish .commit-rollback-button {
          width: 146px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-color: rgba(167, 139, 250, 0.42);
          background: rgba(124, 58, 237, 0.12);
          box-shadow: 0 0 22px rgba(124, 58, 237, 0.12);
          font-size: 15px;
          font-weight: 700;
        }

        .commits-page-polish .commit-options-button:hover,
        .commits-page-polish .commit-rollback-button:hover {
          border-color: rgba(196, 181, 253, 0.62);
          background: rgba(124, 58, 237, 0.18);
        }

        @media (max-width: 980px) {
          .commits-page-polish .commits-panel-header,
          .commits-page-polish .commit-entry-topline,
          .commits-page-polish .commit-create-card {
            grid-template-columns: 1fr;
          }

          .commits-page-polish .commits-panel-header {
            align-items: flex-start;
          }

          .commits-page-polish .commit-entry-actions {
            justify-content: start;
          }
        }
      `}</style>
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
