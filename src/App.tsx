import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { runBuilderExecutionPreview } from "./builderExecution";
import { VerifiedEditPanel } from "./VerifiedEditPanel";
import { WorkspacePreviewPanel } from "./WorkspacePreviewPanel";
import { useAppWorkspaceRuntime } from "./AppWorkspaceRuntime";
import { createWorkspaceFromUserInput } from "./workspaceCreateRuntime";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import {
  applyAndVerifyEdit,
  checkpointVerifiedEdit,
  prepareVerifiedEdit,
  type VerifiedEditState,
} from "./vivusExecutionLoop";
import {
  ChevronDown,
  Code2,
  LayoutGrid,
  Plus,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

// Historical pre-corruption App.tsx restored from builder-runtime-hardening branch
// (exact content restoration target)
export { default } from './App';