import "./TerminalWorkflowPanel.css";
import { addTerminalHistory, clearTerminalHistory, ensureTerminalSession } from "./terminalSessionStore";

type CommandId = "npm_install" | "npm_build" | "npm_test" | "git_status" | "git_diff_stat" | "git_diff";

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

const PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";
const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";

const COMMANDS: Array<{ id: CommandId; label: string; group: string }> = [
  { id: "npm_install", label: "npm install", group: "Project" },
  { id: "npm_build", label: "Build", group: "Project" },
  { id: "npm_test", label: "Test", group: "Project" },
  { id: "git_status", label: "Git Status", group: "Git" },
  { id: "git_diff_stat", label: "Diff Stat", group: "Git" },
  { id: "git_diff", label: "Diff", group: "Git" },
];

let mountedPanel: HTMLElement | null = null;
let projectPath = readProjectPath();
let runningCommand: CommandId | null = null;
let output = "";
let lastStatus = "Idle";
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
      request: {
        projectPath,
        commandId,
      },
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

    lastStatus = response.ok
      ? `Passed: ${response.commandDisplay ?? commandId}`
      : `Failed: ${response.commandDisplay ?? commandId}`;

    appendOutput(`${exitLine}\n`);
    addTerminalHistory(activeSession.id, {
      command: commandLabel,
      output: pieces.join("\n"),
      ok: response.ok,
    });
    activeSession = ensureTerminalSession(projectPath);

    if (response.ok && (commandId === "npm_build" || commandId === "npm_test")) {
      window.dispatchEvent(new Event("vivus-preview-refresh"));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastStatus = "Command failed";
    appendOutput(message);
    addTerminalHistory(activeSession.id, {
      command: commandLabel,
      output: message,
      ok: false,
    });
  } finally {
    runningCommand = null;
    renderMountedPanel();
  }
}

function bindControls() {
  mountedPanel?.querySelector<HTMLInputElement>('[data-terminal-project-path]')?.addEventListener("input", (event) => {
    persistProjectPath((event.currentTarget as HTMLInputElement).value);
  });

  mountedPanel?.querySelector('[data-terminal-clear]')?.addEventListener("click", clearOutput);

  mountedPanel?.querySelectorAll<HTMLElement>('[data-terminal-command]').forEach((button) => {
    button.addEventListener("click", () => {
      const commandId = button.dataset.terminalCommand as CommandId;
      void runCommand(commandId);
    });
  });
}

function renderMountedPanel() {
  if (!mountedPanel) return;

  const projectCommands = COMMANDS.filter((command) => command.group === "Project");
  const gitCommands = COMMANDS.filter((command) => command.group === "Git");

  const renderButtons = (commands: typeof COMMANDS) => commands.map((command) => `
    <button type="button" data-terminal-command="${command.id}" ${runningCommand ? "disabled" : ""}>
      ${escapeHtml(command.label)}
    </button>
  `).join("");

  mountedPanel.innerHTML = `
    <div class="terminal-workflow-header">
      <div>
        <h2>Console</h2>
        <p>Project-aware command runner with persistent per-project output.</p>
      </div>
      <div class="terminal-status ${runningCommand ? "running" : "idle"}">${escapeHtml(lastStatus)}</div>
    </div>

    <label class="terminal-project-path">
      <span>Project folder</span>
      <input type="text" value="${escapeHtml(projectPath)}" spellcheck="false" data-terminal-project-path />
    </label>

    <div class="terminal-command-groups">
      <section>
        <strong>Project</strong>
        <div>${renderButtons(projectCommands)}</div>
      </section>
      <section>
        <strong>Git</strong>
        <div>${renderButtons(gitCommands)}</div>
      </section>
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
  renderMountedPanel();
}

export function startTerminalWorkflowInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const install = () => window.setTimeout(installTerminalWorkflowPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
