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
const defaultPlugins: OpenPlugin[] = ["preview", "builder", "commits"];
const availablePlugins: Array<{ id: OpenPlugin; label: string }> = [
  { id: "preview", label: "Live Preview" },
  { id: "builder", label: "Builder" },
  { id: "files", label: "Files" },
  { id: "commits", label: "Commits" },
  { id: "plugins", label: "Plugins" },
  { id: "console", label: "Console" },
  { id: "publish", label: "Publish" },
];

function normalizeRoute(value: string): Route {
  const cleaned = value.replace("#", "").replace("/", "").trim().toLowerCase();
  if (cleaned === "apps") return "apps";
  if (cleaned === "account") return "account";
  if (cleaned === "workspace") return "workspace";
  return "create";
}

function pluginLabel(id: OpenPlugin) {
  return availablePlugins.find((plugin) => plugin.id === id)?.label ?? id;
}

function shortDate(value: string) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function makePlan(input: string): BuilderPlan {
  const cleaned = input.trim();
  return {
    summary: `Build request captured: ${cleaned}. Vivus will turn this into a scoped implementation plan before editing project files.`,
    requirements: [
      "Preserve the existing working UI and project structure.",
      "Identify the files/components that must change before editing.",
      "Use minimal safe patches instead of broad rewrites.",
      "Keep the result local-first with no hidden telemetry or cloud dependency.",
    ],
    acceptance: [
      "The requested behavior is visible in the app.",
      "No unrelated routes or panels regress.",
      "The project builds successfully after changes.",
      "The user can revise the plan before execution.",
    ],
  };
}
