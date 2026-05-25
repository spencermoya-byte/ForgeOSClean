import React from "react";

import App from "./App";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

export function WorkspaceAwareApp() {
  const [workspaceVersion, setWorkspaceVersion] = React.useState(0);

  React.useEffect(() => {
    return subscribeWorkspaceChanged(() => {
      setWorkspaceVersion((version) => version + 1);
    });
  }, []);

  return <App key={`workspace-app-${workspaceVersion}`} />;
}
