import React from "react";

import App from "./App";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

const MemoizedApp = React.memo(App);

export function WorkspaceAwareApp() {
  const [, forceWorkspaceRefresh] = React.useReducer((value: number) => value + 1, 0);

  React.useEffect(() => {
    return subscribeWorkspaceChanged(() => {
      React.startTransition(() => {
        forceWorkspaceRefresh();
      });
    });
  }, []);

  return <MemoizedApp />;
}
