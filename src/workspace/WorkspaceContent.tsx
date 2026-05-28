import React from "react";
import { Code2 } from "lucide-react";

import { CommitPanel } from "../CommitPanel";
import { ProjectFilesPanel } from "../ProjectFilesPanel";
import { WorkspacePreviewPanel } from "../WorkspacePreviewPanel";

type WorkspaceTab = "preview" | "builder" | "files" | "commits" | "plugins" | "console" | "publish";

type WorkspaceContentProps = {
  workspaceTab: WorkspaceTab;
  hasStartedConversation: boolean;
  activeProjectId: string;
  projectName: string;
  pluginLabel: (id: WorkspaceTab) => string;
  renderBuilderConversation: () => React.ReactNode;
  renderEmptyBuilder: () => React.ReactNode;
};

export function WorkspaceContent({
  workspaceTab,
  hasStartedConversation,
  activeProjectId,
  projectName,
  pluginLabel,
  renderBuilderConversation,
  renderEmptyBuilder,
}: WorkspaceContentProps) {
  if (workspaceTab === "builder") {
    return (
      <section className={`workspace-content builder-workspace ${hasStartedConversation ? "builder-has-conversation" : "builder-is-empty"}`}>
        {hasStartedConversation ? renderBuilderConversation() : renderEmptyBuilder()}
      </section>
    );
  }

  if (workspaceTab === "files") return <ProjectFilesPanel projectId={activeProjectId} />;
  if (workspaceTab === "commits") return <CommitPanel projectName={projectName} />;
  if (workspaceTab === "preview") return <WorkspacePreviewPanel />;

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card">
        <div className="tool-panel-heading">
          <Code2 size={18} />
          <h2>{pluginLabel(workspaceTab)}</h2>
        </div>
        <p className="placeholder-copy">This tool area is reserved for the future {pluginLabel(workspaceTab).toLowerCase()} system.</p>
      </div>
    </section>
  );
}
