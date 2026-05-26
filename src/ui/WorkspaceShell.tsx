import React from "react";

type Props = {
  topBar: React.ReactNode;
  workspaceContent: React.ReactNode;
  dock: React.ReactNode;
  pluginLauncher: React.ReactNode;
};

export function WorkspaceShell({
  topBar,
  workspaceContent,
  dock,
  pluginLauncher,
}: Props) {
  return (
    <main className="workspace-screen">
      {topBar}
      {workspaceContent}
      {dock}
      {pluginLauncher}
    </main>
  );
}
