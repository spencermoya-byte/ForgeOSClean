import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { WorkspacePreviewPanel } from "./WorkspacePreviewPanel";
import { VivusWorkspaceUI } from "./ui/VivusWorkspaceUI";
import { useAppWorkspaceRuntime } from "./AppWorkspaceRuntime";
import { createWorkspaceFromUserInput } from "./workspaceCreateRuntime";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import {
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

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "builder" | "files" | "commits" | "plugins" | "console" | "publish";
type OpenPlugin = WorkspaceTab;
type BuildMode = "build" | "plan";
type BuildMessage = { role: "user" | "assistant"; content: string };
type ProjectRecord = { id: string; name: string; originalPrompt: string; createdAt: string; updatedAt: string; status: "active" | "draft" };
type BuilderPlan = { summary: string; requirements: string[]; acceptance: string[] };
type TaskStatus = "queued" | "running" | "done" | "failed";
type BuilderTask = { id: string; title: string; status: TaskStatus };
type ActivityStatus = "pending" | "active" | "done" | "blocked";
type BuilderActivity = { id: string; label: string; detail: string; status: ActivityStatus };

const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];
const bottomNav: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
  { route: "apps", label: "Apps", icon: <LayoutGrid size={20} strokeWidth={2.2} /> },
  { route: "create", label: "Create", icon: <Sparkles size={20} strokeWidth={2.2} /> },
  { route: "account", label: "Account", icon: <UserRound size={20} strokeWidth={2.2} /> },
];