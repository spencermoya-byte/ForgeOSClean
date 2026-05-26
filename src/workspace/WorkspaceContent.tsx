import React from "react";
import { CommitPanel } from "../CommitPanel";
import { ProjectFilesPanel } from "../ProjectFilesPanel";
import { WorkspacePreviewPanel } from "../WorkspacePreviewPanel";
import { VivusWorkspaceUI } from "../ui/VivusWorkspaceUI";
import { Code2 } from "lucide-react";

export type WorkspaceTab =
  | "preview"
  | "builder"
  | "files"
  | "commits"
  | "plugins"
  | "console"
  | "publish";

type Props = {
  workspaceTab: WorkspaceTab;
  activeProject: any;
  activeProjectId?: string | null;
  buildInput: string;
  setBuildInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  builderPlan: unknown;
  handleApprovePlan: () => void;
  handleBuildSubmit: (event: React.FormEvent) => void;
  pluginLabel: (id: WorkspaceTab) => string;
};

export function WorkspaceContent({
  workspaceTab,
  activeProject,
  activeProjectId,
  buildInput,
  setBuildInput,
  handleKeyDown,
  builderPlan,
  handleApprovePlan,
  handleBuildSubmit,
  pluginLabel,
}: Props) {
  if (workspaceTab === "builder") {
    return (
      <section className="workspace-content builder-workspace">
        <VivusWorkspaceUI
          activeProject={activeProject}
          buildInput={buildInput}
          setBuildInput={setBuildInput}
          handleKeyDown={handleKeyDown}
          onPreparePatch={
            builderPlan
              ? handleApprovePlan
              : () =>
                  handleBuildSubmit({
                    preventDefault() {},
                  } as React.FormEvent)
          }
        />
      </section>
    );
  }

  if (workspaceTab === "files") {
    return (
      <ProjectFilesPanel
        projectId={activeProjectId}
      />
    );
  }

  if (workspaceTab === "commits") {
    return (
      <CommitPanel
        projectName={
          activeProject?.name ??
          "Untitled Project"
        }
      />
    );
  }

  if (workspaceTab === "preview") {
    return (
      <WorkspacePreviewPanel />
    );
  }

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card">
        <div className="tool-panel-heading">
          <Code2 size={18} />
          <h2>
            {pluginLabel(workspaceTab)}
          </h2>
        </div>

        <p className="placeholder-copy">
          This tool area is reserved
          for the future {" "}
          {pluginLabel(
            workspaceTab
          ).toLowerCase()} {" "}
          system.
        </p>
      </div>
    </section>
  );
}
