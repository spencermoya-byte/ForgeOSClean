import React from "react";
import ReactDOM from "react-dom/client";
import { LocalBuilderCoordinatorPanel } from "./LocalBuilderCoordinatorPanel";
import "./LocalBuilderPanel.css";

let mountedElement: HTMLElement | null = null;
let root: ReactDOM.Root | null = null;

function installLocalBuilderPanel() {
  if (typeof document === "undefined") return;

  const workspace = document.querySelector<HTMLElement>(".builder-workspace");
  if (!workspace || workspace === mountedElement) return;

  if (root) {
    root.unmount();
    root = null;
  }

  mountedElement = workspace;
  mountedElement.classList.add("local-builder-workspace-host");
  mountedElement.innerHTML = "";

  root = ReactDOM.createRoot(mountedElement);
  root.render(
    <React.StrictMode>
      <LocalBuilderCoordinatorPanel />
    </React.StrictMode>
  );
}

export function startLocalBuilderInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const install = () => window.setTimeout(installLocalBuilderPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
