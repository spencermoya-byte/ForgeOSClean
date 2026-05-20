import React from "react";
import { runSafeBuilderCommand, type SafeCommandId, type SafeCommandResult } from "./builderExecution";

const safeCommands: Array<{ id: SafeCommandId; label: string }> = [
  { id: "git_status", label: "Git Status" },
  { id: "git_diff_stat", label: "Git Diff Summary" },
  { id: "npm_build", label: "Build Verification" },
];

function commandLabel(commandId: string) {
  return safeCommands.find((command) => command.id === commandId)?.label ?? commandId;
}

function compactOutput(result: SafeCommandResult) {
  const blocked = result.blockedReason ? `Blocked: ${result.blockedReason}` : "";
  const output = [result.stderr, result.stdout]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");

  if (blocked && output) return `${blocked}\n${output}`;
  if (blocked) return blocked;
  if (output) return output;
  return result.ok ? "Command completed with no output." : "Command finished without output details.";
}

export function BuilderSafeVerification({ enabled }: { enabled: boolean }) {
  const [runningCommand, setRunningCommand] = React.useState<SafeCommandId | null>(null);
  const [results, setResults] = React.useState<SafeCommandResult[]>([]);

  async function runCommand(commandId: SafeCommandId) {
    if (!enabled || runningCommand) return;

    setRunningCommand(commandId);
    const result = await runSafeBuilderCommand(commandId, ".");
    setResults((current) => [result, ...current.filter((item) => item.commandId !== commandId)]);
    setRunningCommand(null);
  }

  return (
    <div className="builder-plan-section builder-verification-section">
      <strong>Safe local verification</strong>
      <p>Run approved local checks only. File editing remains disabled until the safe patch layer is added.</p>
      <div className="safe-command-actions">
        {safeCommands.map((command) => (
          <button key={command.id} type="button" onClick={() => runCommand(command.id)} disabled={!enabled || Boolean(runningCommand)}>
            {runningCommand === command.id ? "Running..." : command.label}
          </button>
        ))}
      </div>
      {results.length > 0 && (
        <div className="safe-command-results">
          {results.map((result) => (
            <div key={result.commandId} className={`safe-command-result ${result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}`}>
              <div className="safe-command-result-header">
                <span>{commandLabel(result.commandId)}</span>
                <em>{result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}</em>
              </div>
              <code>{result.commandDisplay}</code>
              <small>Exit: {typeof result.exitCode === "number" ? result.exitCode : "n/a"} · {result.durationMs}ms</small>
              <pre>{compactOutput(result)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
