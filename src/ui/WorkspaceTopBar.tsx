import React from "react";
import { ChevronDown } from "lucide-react";

type ProjectRecord = {
  id: string;
  name: string;
  updatedAt: string;
};

type Props = {
  activeProjectName?: string;
  activeProjectId?: string | null;
  projects: ProjectRecord[];
  showProjectMenu: boolean;
  setShowProjectMenu: React.Dispatch<React.SetStateAction<boolean>>;
  openProject: (project: ProjectRecord) => void;
  navigateHome: () => void;
  shortDate: (value: string) => string;
};

export function WorkspaceTopBar({
  activeProjectName,
  activeProjectId,
  projects,
  showProjectMenu,
  setShowProjectMenu,
  openProject,
  navigateHome,
  shortDate,
}: Props) {
  return (
    <header className="workspace-topbar">
      <div className="workspace-brand project-switcher-wrap">
        <div className="logo-box">V</div>

        <button
          type="button"
          className="project-name"
          onClick={() =>
            setShowProjectMenu(
              (open) => !open
            )
          }
          aria-expanded={showProjectMenu}
        >
          {activeProjectName ??
            "No Workspace Selected"}
          <ChevronDown
            size={16}
            strokeWidth={2.4}
          />
        </button>

        {showProjectMenu && (
          <div className="project-switcher-menu">
            <div className="project-switcher-header">
              Workspaces
            </div>

            {projects.length === 0 ? (
              <div className="project-switcher-empty">
                No saved workspaces yet
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={
                    project.id ===
                    activeProjectId
                      ? "project-switcher-item active"
                      : "project-switcher-item"
                  }
                  onClick={() =>
                    openProject(project)
                  }
                >
                  <strong>
                    {project.name}
                  </strong>
                  <span>
                    {shortDate(
                      project.updatedAt
                    )}
                  </span>
                </button>
              ))
            )}

            <button
              type="button"
              className="project-switcher-new"
              onClick={() => {
                setShowProjectMenu(false);
                navigateHome();
              }}
            >
              New Workspace
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={navigateHome}
        style={{
          marginLeft: "auto",
          height: "36px",
          padding: "0 14px",
          borderRadius: "10px",
          border:
            "1px solid rgba(167, 139, 250, 0.24)",
          background:
            "rgba(255,255,255,0.05)",
          color: "#f8fafc",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        Home
      </button>
    </header>
  );
}
