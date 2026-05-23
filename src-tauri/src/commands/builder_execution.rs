use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::Duration;
use tokio::process::Command;
use tokio::time::timeout;

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderExecutionTask {
    pub id: String,
    pub title: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderExecutionActivity {
    pub id: String,
    pub label: String,
    pub detail: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuildDiagnostic {
    pub file: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
    pub code: Option<String>,
    pub message: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderExecutionPreviewResponse {
    #[serde(rename = "backendAvailable")]
    pub backend_available: bool,
    pub message: String,
    pub tasks: Vec<BuilderExecutionTask>,
    pub activity: Vec<BuilderExecutionActivity>,
    pub diagnostics: Vec<BuildDiagnostic>,
}

struct SafeCommandResult {
    success: bool,
    summary: String,
    full_output: String,
}

#[derive(Clone)]
struct PatchTarget {
    path: &'static str,
    reason: &'static str,
}

fn repo_root() -> Result<PathBuf, String> {
    std::env::current_dir().map_err(|error| format!("Unable to resolve current working directory: {error}"))
}

fn exists(path: &Path) -> bool {
    std::fs::metadata(path).is_ok()
}

fn combined_output(stdout: &[u8], stderr: &[u8]) -> String {
    let out = String::from_utf8_lossy(stdout).trim().to_string();
    let err = String::from_utf8_lossy(stderr).trim().to_string();
    match (out.is_empty(), err.is_empty()) {
        (false, false) => format!("{out}\n{err}"),
        (false, true) => out,
        (true, false) => err,
        (true, true) => "No output".to_string(),
    }
}

fn compact_text(text: &str, max_len: usize) -> String {
    if text.len() > max_len {
        format!("{}...", &text[..max_len])
    } else {
        text.to_string()
    }
}

fn infer_patch_targets(plan_summary: &str) -> Vec<PatchTarget> {
    let lower = plan_summary.to_lowercase();
    let mut targets = Vec::new();

    if lower.contains("builder") || lower.contains("plan") || lower.contains("task") || lower.contains("execution") {
        targets.push(PatchTarget { path: "src/App.tsx", reason: "Builder workflow state and UI are currently orchestrated in App.tsx." });
        targets.push(PatchTarget { path: "src/BuilderWorkflow.css", reason: "Builder plan/task/activity presentation styles live in BuilderWorkflow.css." });
    }

    if lower.contains("backend") || lower.contains("tauri") || lower.contains("terminal") || lower.contains("build") || lower.contains("file") {
        targets.push(PatchTarget { path: "src-tauri/src/commands/builder_execution.rs", reason: "Local execution, verification, and safety gates live in builder_execution.rs." });
    }

    if lower.contains("composer") || lower.contains("textbox") || lower.contains("chat") || lower.contains("onboarding") {
        targets.push(PatchTarget { path: "src/BuilderLifecycle.css", reason: "Builder composer lifecycle sizing and positioning styles live in BuilderLifecycle.css." });
    }

    if targets.is_empty() {
        targets.push(PatchTarget { path: "src/App.tsx", reason: "Default safe target for app-level behavior changes." });
    }

    targets
}

fn inspect_patch_targets(root: &Path, targets: &[PatchTarget]) -> (bool, String) {
    let mut all_exist = true;
    let mut details = Vec::new();

    for target in targets {
        let target_path = root.join(target.path);
        let target_exists = exists(&target_path);
        if !target_exists {
            all_exist = false;
        }
        details.push(format!("{}: {} ({})", target.path, if target_exists { "found" } else { "missing" }, target.reason));
    }

    (all_exist, details.join(" | "))
}

fn parse_location_prefix(line: &str) -> (Option<String>, Option<u32>, Option<u32>) {
    let Some((maybe_path, rest)) = line.split_once('(') else {
        return (None, None, None);
    };
    let Some((location, _message)) = rest.split_once(')') else {
        return (None, None, None);
    };
    let mut parts = location.split(',');
    let line_number = parts.next().and_then(|value| value.parse::<u32>().ok());
    let column_number = parts.next().and_then(|value| value.parse::<u32>().ok());
    if maybe_path.contains('.') && line_number.is_some() {
        (Some(maybe_path.to_string()), line_number, column_number)
    } else {
        (None, None, None)
    }
}

fn extract_ts_code(line: &str) -> Option<String> {
    let marker = "error TS";
    let index = line.find(marker)?;
    let code_start = index + "error ".len();
    let code = line.get(code_start..)?.split(':').next()?.trim();
    Some(code.to_string())
}

fn parse_build_diagnostics(output: &str) -> Vec<BuildDiagnostic> {
    let mut diagnostics = Vec::new();

    for raw_line in output.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        let is_error = line.contains("error TS") || line.to_lowercase().contains("error:") || line.contains("Failed to compile") || line.contains("Could not resolve");
        if !is_error {
            continue;
        }

        let (file, line_number, column_number) = parse_location_prefix(line);
        diagnostics.push(BuildDiagnostic {
            file,
            line: line_number,
            column: column_number,
            code: extract_ts_code(line),
            message: compact_text(line, 360),
        });

        if diagnostics.len() >= 12 {
            break;
        }
    }

    diagnostics
}

async fn command_available(command: &str, arg: &str) -> bool {
    Command::new(command).arg(arg).output().await.is_ok()
}

async fn run_safe_command(root: &Path, command: &str, args: &[&str], seconds: u64) -> SafeCommandResult {
    let execution = Command::new(command).args(args).current_dir(root).output();

    match timeout(Duration::from_secs(seconds), execution).await {
        Ok(Ok(output)) => {
            let full_output = combined_output(&output.stdout, &output.stderr);
            SafeCommandResult {
                success: output.status.success(),
                summary: compact_text(&full_output, 720),
                full_output,
            }
        }
        Ok(Err(error)) => SafeCommandResult {
            success: false,
            summary: format!("Failed to run {command}: {error}"),
            full_output: format!("Failed to run {command}: {error}"),
        },
        Err(_) => SafeCommandResult {
            success: false,
            summary: format!("Timed out after {seconds}s while running {command}"),
            full_output: format!("Timed out after {seconds}s while running {command}"),
        },
    }
}

fn task(id: &str, title: &str, status: &str) -> BuilderExecutionTask {
    BuilderExecutionTask { id: id.to_string(), title: title.to_string(), status: status.to_string() }
}

fn activity(id: &str, label: &str, detail: String, status: &str) -> BuilderExecutionActivity {
    BuilderExecutionActivity { id: id.to_string(), label: label.to_string(), detail, status: status.to_string() }
}

#[tauri::command]
pub async fn vivus_execution_preview(plan_summary: String) -> Result<BuilderExecutionPreviewResponse, String> {
    let root = repo_root()?;
    let package_json = root.join("package.json");
    let src_dir = root.join("src");
    let tauri_dir = root.join("src-tauri");
    let git_dir = root.join(".git");

    let has_package_json = exists(&package_json);
    let has_src_dir = exists(&src_dir);
    let has_tauri_dir = exists(&tauri_dir);
    let has_git = exists(&git_dir);
    let has_node = command_available("node", "--version").await;
    let has_npm = command_available("npm", "--version").await;

    let source_ready = has_package_json && has_src_dir;
    let verification_ready = has_npm && has_package_json;
    let plan_preview = plan_summary.chars().take(140).collect::<String>();
    let patch_targets = infer_patch_targets(&plan_summary);
    let (patch_targets_ready, patch_target_summary) = inspect_patch_targets(&root, &patch_targets);

    let git_status = if has_git { Some(run_safe_command(&root, "git", &["status", "--short"], 20).await) } else { None };
    let build_result = if verification_ready { Some(run_safe_command(&root, "npm", &["run", "build"], 120).await) } else { None };

    let build_success = build_result.as_ref().map(|result| result.success).unwrap_or(false);
    let git_success = git_status.as_ref().map(|result| result.success).unwrap_or(false);
    let patch_ready = source_ready && patch_targets_ready && git_success;
    let diagnostics = build_result.as_ref().map(|result| parse_build_diagnostics(&result.full_output)).unwrap_or_default();

    let tasks = vec![
        task("task-1", "Analyze the request and convert it into acceptance criteria", "done"),
        task("task-2", "Find the relevant project files and verify current source state", if source_ready { "done" } else { "failed" }),
        task("task-3", "Run safe repository status check", if has_git && git_success { "done" } else if has_git { "failed" } else { "queued" }),
        task("task-4", "Run build/type verification", if build_success { "done" } else if verification_ready { "failed" } else { "queued" }),
        task("task-5", "Parse build diagnostics", if build_success { "done" } else if !diagnostics.is_empty() { "done" } else if verification_ready { "failed" } else { "queued" }),
        task("task-6", "Prepare safe patch target plan", if patch_ready { "done" } else { "failed" }),
    ];

    let mut activity_items = vec![
        activity("activity-1", "Plan received", format!("Received approved plan: {plan_preview}"), "done"),
        activity("activity-2", "Project detection", format!("package.json: {has_package_json}, src/: {has_src_dir}, src-tauri/: {has_tauri_dir}, git: {has_git}"), if source_ready { "done" } else { "blocked" }),
        activity("activity-3", "Tool detection", format!("node: {has_node}, npm: {has_npm}"), if verification_ready { "done" } else { "blocked" }),
    ];

    if let Some(result) = git_status {
        activity_items.push(activity("activity-4", "Git status", result.summary, if result.success { "done" } else { "blocked" }));
    } else {
        activity_items.push(activity("activity-4", "Git status", "No .git directory detected, so repository status was skipped.".to_string(), "pending"));
    }

    if let Some(result) = build_result {
        activity_items.push(activity("activity-5", "Build verification", result.summary, if result.success { "done" } else { "blocked" }));
    } else {
        activity_items.push(activity("activity-5", "Build verification", "Build skipped because npm or package.json is unavailable.".to_string(), "blocked"));
    }

    activity_items.push(activity(
        "activity-6",
        "Build diagnostics",
        if diagnostics.is_empty() { "No structured build diagnostics were detected.".to_string() } else { format!("{} diagnostic(s) detected. First: {}", diagnostics.len(), diagnostics[0].message) },
        if build_success || !diagnostics.is_empty() { "done" } else { "blocked" },
    ));

    activity_items.push(activity("activity-7", "Patch target plan", patch_target_summary, if patch_targets_ready { "done" } else { "blocked" }));

    let message = if patch_ready && verification_ready && build_success {
        "Build verification passed. Repo status, target planning, and diagnostics parsing completed."
    } else if verification_ready && !diagnostics.is_empty() {
        "Build verification failed, but Vivus parsed structured diagnostics for the repair loop."
    } else if verification_ready {
        "Build verification ran, but npm run build failed without structured diagnostics."
    } else {
        "Safe execution phase completed project/tool checks, but build verification could not run yet."
    };

    Ok(BuilderExecutionPreviewResponse {
        backend_available: true,
        message: message.to_string(),
        tasks,
        activity: activity_items,
        diagnostics,
    })
}
