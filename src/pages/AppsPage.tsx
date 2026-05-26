type ProjectRecord = {
  id: string;
  name: string;
  originalPrompt: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "draft";
};

type AppsPageProps = {
  projects: ProjectRecord[];
  shortDate: (
    value: string
  ) => string;
  onOpenProject: (
    project: ProjectRecord
  ) => void;
  onNavigateCreate: () => void;
};

export function AppsPage({
  projects,
  shortDate,
  onOpenProject,
  onNavigateCreate,
}: AppsPageProps) {
  return (
    <main className="simple-page">
      <div className="page-shell">
        <div className="page-heading-row">
          <div>
            <h1>Apps</h1>
            <p>
              Saved local Vivus
              workspaces.
            </p>
          </div>

          <button
            type="button"
            className="soft-button"
            onClick={
              onNavigateCreate
            }
          >
            New Workspace
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="app-card">
            <div className="app-preview">
              <span>
                No saved
                workspaces yet
              </span>
            </div>

            <h2>
              Create your first
              workspace
            </h2>

            <p>
              Describe an idea or
              paste a local path
              on the Create page
              and Vivus will save
              it locally as a
              workspace.
            </p>

            <button
              type="button"
              className="soft-button"
              onClick={
                onNavigateCreate
              }
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="project-list">
            {projects.map(
              (project) => (
                <button
                  key={project.id}
                  type="button"
                  className="project-card"
                  onClick={() =>
                    onOpenProject(
                      project
                    )
                  }
                >
                  <div className="project-card-topline">
                    <span>
                      {
                        project.status
                      }
                    </span>

                    <em>
                      {shortDate(
                        project.updatedAt
                      )}
                    </em>
                  </div>

                  <h2>
                    {project.name}
                  </h2>

                  <p>
                    {
                      project.originalPrompt
                    }
                  </p>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
