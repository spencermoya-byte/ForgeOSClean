import React from "react";
import { ChevronDown } from "lucide-react";

import { useAppWorkspaceProjects } from "./appWorkspaceHooks";
import { switchWorkspace } from "./workspaceProjectActions";
import type { AppProjectRecord } from "./workspaceProjectAdapter";

type AppWorkspaceSwitcherProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenProject: (project: AppProjectRecord) => void;
  onCreateProject: () => void;
  shortDate: (value: string) => string;
};

export function AppWorkspaceSwitcher({ open, onToggle, onClose, onOpenProject, onCreateProject, shortDate }: AppWorkspaceSwitcherProps) {
  const { projects, activeProject, activeProjectId } = useAppWorkspaceProjects();

  function handleOpenProject(project: AppProjectRecord) {
    switchWorkspace(project.id);
    onOpenProject(project);
    onClose();
  }

  return (
    <>
      <button type="button" className="project-name" onClick={onToggle} aria-expanded={open}>
        {activeProject?.name ?? "No Workspace Selected"} <ChevronDown size={16} strokeWidth={2.4} />
      </button>
      {open && (
        <div className="project-switcher-menu">
          <div className="project-switcher-header">Projects</div>
          {projects.length === 0 ? (
            <div className="project-switcher-empty">No saved projects yet</div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={project.id === activeProjectId ? "project-switcher-item active" : "project-switcher-item"}
                onClick={() => handleOpenProject(project)}
              >
                <strong>{project.name}</strong>
                <span>{shortDate(project.updatedAt)}</span>
              </button>
            ))
          )}
          <button type="button" className="project-switcher-new" onClick={onCreateProject}>New Project</button>
        </div>
      )}
    </>
  );
}
