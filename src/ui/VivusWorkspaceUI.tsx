

export function VivusWorkspaceUI({
  activeProject,
  buildInput,
  setBuildInput,
  handleKeyDown,
  onPreparePatch,
}: any) {
  return (
    <section className="vivus-builder-v2">
      <div className="builder-shell">
        <div className="builder-top-grid">
          <div className="builder-status-card">
            <span>Workspace</span>
            <strong>{activeProject?.name ?? 'No Workspace'}</strong>
          </div>
          <div className="builder-status-card">
            <span>Planner</span>
            <strong>qwen3.6:27b</strong>
          </div>
          <div className="builder-status-card">
            <span>Coder</span>
            <strong>qwen3-coder:30b</strong>
          </div>
        </div>

        <section className="builder-main-card">
          <textarea
            className="builder-main-input"
            placeholder="Describe the change Vivus should make to the project..."
            value={buildInput}
            onChange={(e) => setBuildInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="builder-patch-button"
            type="button"
            onClick={onPreparePatch}
          >
            Prepare Patch
          </button>
        </section>

        <div className="builder-bottom-grid">
          <section className="builder-card"><h3>Live execution timeline</h3></section>
          <section className="builder-card"><h3>Recent builder history</h3></section>
          <section className="builder-card"><h3>Session state</h3></section>
        </div>
      </div>
    </section>
  );
}
