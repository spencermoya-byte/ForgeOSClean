import "./TerminalWorkflowPanel.css";
import {
  activateTerminalSession,
  addTerminalHistory,
  clearTerminalHistory,
  createTerminalSession,
  deleteTerminalSession,
  ensureTerminalSession,
  listTerminalSessions,
} from "./terminalSessionStore";

type CommandId =
  | "npm_install"
  | "npm_build"
  | "npm_test"
  | "npm_lint"
  | "npm_typecheck"
  | "git_status"
  | "git_diff_stat"
  | "git_diff"
  | "git_log"
  | "git_branch"
  | "git_cached_diff";

type SafeCommandResponse = {
  ok: boolean;
  commandId?: string;
  commandDisplay?: string;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  durationMs?: number;
  blockedReason?: string;
};

type DevServerResponse = {
  ok: boolean;
  url: string;
  pid?: number | null;
  status: string;
  projectPath?: string | null;
  blockedReason?: string | null;
};

const PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";
const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";

const COMMANDS: Array<{ id: CommandId; label: string; group: string }> = [
  { id: "npm_install", label: "npm install", group: "Project" },
  { id: "npm_build", label: "Build", group: "Project" },
  { id: "npm_test", label: "Test", group: "Project" },
  { id: "npm_lint", label: "Lint", group: "Project" },
  { id: "npm_typecheck", label: "Typecheck", group: "Project" },
  { id: "git_status", label: "Git Status", group: "Git" },
  { id: "git_diff_stat", label: "Diff Stat", group: "Git" },
  { id: "git_diff", label: "Diff", group: "Git" },
  { id: "git_cached_diff", label: "Staged Diff", group: "Git" },
  { id: "git_log", label: "Commit History", group: "Git" },
  { id: "git_branch", label: "Current Branch", group: "Git" },
];

let mountedPanel: HTMLElement | null = null;
let projectPath = readProjectPath();
let runningCommand: CommandId | "dev-server" | null = null;
let output = "";
let lastStatus = "Idle";
let devServerStatus = "unknown";
let devServerUrl = "";
let activeSession = ensureTerminalSession(projectPath);

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function readProjectPath() {
  try {
    return window.localStorage.getItem(PROJECT_PATH_KEY)?.trim() || DEFAULT_PROJECT_PATH;
  } catch {
    return DEFAULT_PROJECT_PATH;
  }
}

function restoreSessionOutput() {
  activeSession = ensureTerminalSession(projectPath);

  if (!activeSession.history.length) {
    output = "Vivus terminal ready. Choose an allowlisted project command.\n";
    return;
  }

  output = activeSession.history
    .slice()
    .reverse()
    .map((entry) => `$ ${entry.command}\n${entry.output}`)
    .join("\n\n");

  if (!output.endsWith("\n")) output += "\n";
}

function persistProjectPath(path: string) {
  projectPath = path.trim() || DEFAULT_PROJECT_PATH;

  try {
    window.localStorage.setItem(PROJECT_PATH_KEY, projectPath);
  } catch {}

  restoreSessionOutput();
  void refreshDevServerStatus();
  renderMountedPanel();
}

function switchSession(sessionId: string) {
  activeSession = activateTerminalSession(projectPath, sessionId);
  restoreSessionOutput();
  lastStatus = `Active: ${activeSession.name}`;
  renderMountedPanel();
}

function createSession() {
  activeSession = createTerminalSession(projectPath);
  restoreSessionOutput();
  lastStatus = `Created: ${activeSession.name}`;
  renderMountedPanel();
}

function deleteSession(sessionId: string) {
  activeSession = deleteTerminalSession(projectPath, sessionId);
  restoreSessionOutput();
  lastStatus = "Terminal deleted";
  renderMountedPanel();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[char] ?? char));
}

function appendOutput(text: string) {
  output += text;
  if (!output.endsWith("\n")) output += "\n";
  renderMountedPanel();
}

function clearOutput() {
  output = "";
  clearTerminalHistory(activeSession.id);
  activeSession = ensureTerminalSession(projectPath);
  lastStatus = "Cleared";
  renderMountedPanel();
}

async function invokeDevServer(command: "vivus_start_dev_server" | "vivus_stop_dev_server" | "vivus_dev_server_status") {
  if (!hasTauriRuntime()) {
    appendOutput("Tauri runtime is required for dev server controls.");
    return null;
  }

  const { invoke } = await import("@tauri-apps/api/core");
  if (command === "vivus_start_dev_server") {
    return invoke<DevServerResponse>(command, { request: { projectPath } });
  }
  return invoke<DevServerResponse>(command);
}

async function refreshDevServerStatus() {
  try {
    const response = await invokeDevServer("vivus_dev_server_status");
    if (!response) return;
    devServerStatus = response.status;
    devServerUrl = response.url || devServerUrl;
    renderMountedPanel();
  } catch {
    devServerStatus = "unknown";
  }
}

async function startDevServer() {
  if (runningCommand) return;
  runningCommand = "dev-server";
  lastStatus = "Starting dev server...";
  appendOutput("\n$ npm run dev\n");

  try {
    const response = await invokeDevServer("vivus_start_dev_server");
    if (!response) return;
    devServerStatus = response.status;
    devServerUrl = response.url || devServerUrl;
    lastStatus = response.ok ? `Preview ${response.status}` : "Preview failed";
    appendOutput(response.ok ? `Preview server ${response.status}: ${response.url || "pending"}` : `Preview failed: ${response.blockedReason ?? "unknown"}`);
    if (response.ok) window.dispatchEvent(new Event("vivus-preview-refresh"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastStatus = "Preview failed";
    appendOutput(message);
  } finally {
    runningCommand = null;
    renderMountedPanel();
  }
}

async function stopDevServer() {
  if (runningCommand) return;
  runningCommand = "dev-server";
  lastStatus = "Stopping dev server...";
  appendOutput("\n$ stop preview server\n");

  try {
    const response = await invokeDevServer("vivus_stop_dev_server");
    if (!response) return;
    devServerStatus = response.status;
    devServerUrl = response.url || "";
    lastStatus = response.ok ? "Preview stopped" : "Preview stop failed";
    appendOutput(response.ok ? "Preview server stopped." : `Preview stop failed: ${response.blockedReason ?? "unknown"}`);
    window.dispatchEvent(new Event("vivus-preview-refresh"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastStatus = "Preview stop failed";
    appendOutput(message);
  } finally {
    runningCommand = null;
    renderMountedPanel();
  }
}

async function runCommand(commandId: CommandId) {
  if (runningCommand) return;

  if (!hasTauriRuntime()) {
    appendOutput("Tauri runtime is required for project commands.");
    return;
  }

  const commandLabel = COMMANDS.find((command) => command.id === commandId)?.label ?? commandId;
  runningCommand = commandId;
  lastStatus = `Running ${commandLabel}...`;
  appendOutput(`\n$ ${commandLabel}\n`);

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const response = await invoke<SafeCommandResponse>("vivus_run_safe_command", {
      request: { projectPath, commandId },
    });

    const stdout = response.stdout?.trimEnd() ?? "";
    const stderr = response.stderr?.trimEnd() ?? "";
    const pieces = [stdout, stderr].filter(Boolean);

    if (stdout) appendOutput(stdout);
    if (stderr) appendOutput(stderr);

    if (response.blockedReason) {
      pieces.push(`Blocked: ${response.blockedReason}`);
      appendOutput(`Blocked: ${response.blockedReason}`);
    }

    const exitLine = `Exit: ${response.exitCode ?? "n/a"} • ${response.durationMs ?? 0}ms`;
    pieces.push(exitLine);
    lastStatus = response.ok ? `Passed: ${response.commandDisplay ?? commandId}` : `Failed: ${response.commandDisplay ?? commandId}`;
    appendOutput(`${exitLine}\n`);

    addTerminalHistory(activeSession.id, { command: commandLabel, output: pieces.join("\n"), ok: response.ok });
    activeSession = ensureTerminalSession(projectPath);

    if (response.ok && ["npm_build", "npm_test", "npm_lint", "npm_typecheck"].includes(commandId)) {
      window.dispatchEvent(new Event("vivus-preview-refresh"));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastStatus = "Command failed";
    appendOutput(message);
    addTerminalHistory(activeSession.id, { command: commandLabel, output: message, ok: false });
  } finally {
    runningCommand = null;
    renderMountedPanel();
  }
}

function bindControls() {
  mountedPanel?.querySelector<HTMLInputElement>("[data-terminal-project-path]")?.addEventListener("input", (event) => persistProjectPath((event.currentTarget as HTMLInputElement).value));
  mountedPanel?.querySelector("[data-terminal-clear]")?.addEventListener("click", clearOutput);
  mountedPanel?.querySelector("[data-terminal-new]")?.addEventListener("click", createSession);
  mountedPanel?.querySelector("[data-terminal-start-preview]")?.addEventListener("click", () => void startDevServer());
  mountedPanel?.querySelector("[data-terminal-stop-preview]")?.addEventListener("click", () => void stopDevServer());
  mountedPanel?.querySelector("[data-terminal-refresh-preview-status]")?.addEventListener("click", () => void refreshDevServerStatus());

  mountedPanel?.querySelectorAll<HTMLElement>("[data-terminal-session]").forEach((button) => {
    button.addEventListener("click", () => switchSession(button.dataset.terminalSession ?? activeSession.id));
  });

  mountedPanel?.querySelectorAll<HTMLElement>("[data-terminal-delete-session]").forEach((button) => {
    button.addEventListener("click", () => deleteSession(button.dataset.terminalDeleteSession ?? activeSession.id));
  });

  mountedPanel?.querySelectorAll<HTMLElement>("[data-terminal-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const commandId = button.dataset.terminalCommand as CommandId;
      void runCommand(commandId);
    });
  });
}

function renderMountedPanel() {
  if (!mountedPanel) return;

  const sessions = listTerminalSessions(projectPath);
  const projectCommands = COMMANDS.filter((command) => command.group === "Project");
  const gitCommands = COMMANDS.filter((command) => command.group === "Git");

  const renderButtons = (commands: typeof COMMANDS) => commands.map((command) => `
    <button type="button" data-terminal-command="${command.id}" ${runningCommand ? "disabled" : ""}>
      ${escapeHtml(command.label)}
    </button>
  `).join("");

  const renderSessions = () => sessions.map((session) => `
    <button type="button" data-terminal-session="${session.id}" class="${session.id === activeSession.id ? "active" : ""}">
      ${escapeHtml(session.name)}
    </button>
  `).join("");

  mountedPanel.innerHTML = `
    <div class="terminal-workflow-header">
      <div>
        <h2>Console</h2>
        <p>Persistent project terminal for build, git, verification, preview, and debugging.</p>
      </div>
      <div class="terminal-status ${runningCommand ? "running" : "idle"}">${escapeHtml(lastStatus)}</div>
    </div>

    <label class="terminal-project-path">
      <span>Project folder</span>
      <input type="text" value="${escapeHtml(projectPath)}" spellcheck="false" data-terminal-project-path />
    </label>

    <div class="terminal-session-tabs">
      <div>${renderSessions()}</div>
      <button type="button" data-terminal-new>+ Terminal</button>
      ${sessions.length > 1 ? `<button type="button" data-terminal-delete-session="${activeSession.id}">Delete Current</button>` : ""}
    </div>

    <div class="terminal-preview-controls">
      <strong>Preview server</strong>
      <span>${escapeHtml(devServerStatus)}${devServerUrl ? ` • ${escapeHtml(devServerUrl)}` : ""}</span>
      <button type="button" data-terminal-start-preview ${runningCommand ? "disabled" : ""}>Start Preview</button>
      <button type="button" data-terminal-stop-preview ${runningCommand ? "disabled" : ""}>Stop Preview</button>
      <button type="button" data-terminal-refresh-preview-status ${runningCommand ? "disabled" : ""}>Status</button>
    </div>

    <div class="terminal-command-groups">
      <section><strong>Project</strong><div>${renderButtons(projectCommands)}</div></section>
      <section><strong>Git</strong><div>${renderButtons(gitCommands)}</div></section>
    </div>

    <div class="terminal-output-toolbar">
      <span>${escapeHtml(activeSession.name)} • ${activeSession.history.length} saved command${activeSession.history.length === 1 ? "" : "s"}</span>
      <button type="button" data-terminal-clear>Clear</button>
    </div>

    <pre class="terminal-output">${escapeHtml(output)}</pre>
  `;

  bindControls();
}

function installTerminalWorkflowPanel() {
  if (typeof document === "undefined") return;
  const cards = Array.from(document.querySelectorAll<HTMLElement>(".tool-panel-card"));
  const consoleCard = cards.find((card) => card.textContent?.includes("Console"));
  if (!consoleCard || consoleCard.querySelector(".terminal-workflow-header")) return;
  mountedPanel = consoleCard;
  mountedPanel.classList.add("terminal-workflow-panel");
  projectPath = readProjectPath();
  restoreSessionOutput();
  void refreshDevServerStatus();
  renderMountedPanel();
}

export function startTerminalWorkflowInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const install = () => window.setTimeout(installTerminalWorkflowPanel, 0);
  install();
  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
