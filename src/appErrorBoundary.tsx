import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown) {
    console.error("Vivus workspace error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-shell">
        <section className="empty-state-card">
          <h1>Vivus recovered from a workspace error</h1>
          <p>{this.state.message || "An unknown workspace error occurred."}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload Workspace
          </button>
        </section>
      </main>
    );
  }
}
