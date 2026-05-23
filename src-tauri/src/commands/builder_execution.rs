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
pub struct BuilderExecutionPreviewResponse {
    #[serde(rename = "backendAvailable")]
    pub backend_available: bool,
    pub message: String,
    pub tasks: Vec<BuilderExecutionTask>,
    pub activity: Vec<BuilderExecutionActivity>,
}

struct SafeCommandResult {
    success: bool,
    summary: String,
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

fn compact_output(stdout: &[u8], stderr: &[u8]) -> String {
    let mut text = String::new();
    let out = String::from_utf8_lossy(stdout).trim().to_string();
    let err = String::from_utf8_lossy(stderr).trim().to_string();

    if !out.is_empty() {
        text.push_str(&out);
    }

    if !err.is_empty() {
        if !text.is_empty() {
            text.push_str(" | ");
        }
        text.push_str(&err);
    }

    if text.len() > 420 {
        format!("{}...", &text[..420])
    } else if text.is_empty() {
        "No output".to_string()
    } else {
        text
    }
}

fn infer_patch_targets(plan_summary: &str) -> Vec<PatchTarget> {
    let lower = plan_summary.to_lowercase();
    let mut targets = Vec::new();

    if lower.contains("builder") || lower.contains("plan") || lower.contains("task") || lower.contains("execution") {
        targets.push(PatchTarget {
            path: "src/App.tsx",
            reason: "Builder workflow state and UI are currently orchestrated in App.tsx.",
        });
        targets.push(PatchTarget {
            path: "src/BuilderWorkflow.css",
            reason: "Builder plan/task/activity presentation styles live in BuilderWorkflow.css.",
        });
    }

    if lower.contains("backend") || lower.contains("tauri") || lower.contains("terminal") || lower.contains("build") || lower.contains("file") {
        targets.push(PatchTarget {
            path: "src-tauri/src/commands/builder_execution.rs",
            reason: "Local execution, verification, and safety gates live in builder_execution.rs.",
        });
    }

    if lower.contains("composer") || lower.contains("textbox") || lower.contains("chat") || lower.contains("onboarding") {
        targets.push(PatchTarget {
            path: "src/BuilderLifecycle.css",
            reason: "Builder composer lifecycle sizing and positioning styles live in BuilderLifecycle.css.",
        });
    }

    if targets.is_empty() {
        targets.push(PatchTarget {
            path: "src/App.tsx",
            reason: "Default safe target for app-level behavior changes.",
        });
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

async fn command_available(command: &str, arg: &str) -> bool {
    Command::new(command).arg(arg).output().await.is_ok()
}

async fn run_safe_command(root: &Path, command: &str, args: &[&str], seconds: u64) -> SafeCommandResult {
    let execution = Command::new(command)
        .args(args)
        .current_dir(root)
        .output();

    match timeout(Duration::from_secs(seconds), execution).await {
        Ok(Ok(output)) => SafeCommandResult {
            success: output.status.success(),
            summary: compact_output(&output.stdout, &output.stderr),
        },
        Ok(Err(error)) => SafeCommandResult {
            success: false,
            summary: format!("Failed to run {command}: {error}"),
        },
        Err(_) => SafeCommandResult {
            success: false,
            summary: format!("Timed out after {seconds}s while running {command}"),
        },
    }
}

fn task(id: &str, title: &str, status: &str) -> BuilderExecutionTask {
    BuilderExecutionTask {
        id: id.to_string(),
        title: title.to_string(),
        status: status.to_string(),
    }
}

fn activity(id: &str, label: &str, detail: String, status: &str) -> BuilderExecutionActivity {
    BuilderExecutionActivity {
        id: id.to_string(),
        label: label.to_string(),
        detail,
        status: status.to_string(),
    }
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

    let git_status = if has_git {
        Some(run_safe_command(&root, "git", &["status", "--short"], 20).await)
    } else {
        None
    };

    let build_result = if verification_ready {
        Some(run_safe_command(&root, "npm", &["run", "build"], 120).await)
    } else {
        None
    };

    let build_success = build_result.as_ref().map(|result| result.success).unwrap_or(false);
    let git_success = git_status.as_ref().map(|result| result.success).unwrap_or(false);
    let patch_ready = source_ready && patch_targets_ready && git_success;

    let tasks = vec![
        task("task-1", "Analyze the request and convert it into acceptance criteria", "done"),
        task(
            "task-2",
            "Find the relevant project files and verify current source state",
            if source_ready { "done" } else { "failed" },
        ),
        task(
            "task-3",
            "Run safe repository status check",
            if has_git && git_success { "done" } else if has_git { "failed" } else { "queued" },
        ),
        task(
            "task-4",
            "Run build/type verification",
            if build_success { "done" } else if verification_ready { "failed" } else { "queued" },
        ),
        task(
            "task-5",
            "Prepare safe patch target plan",
            if patch_ready { "done" } else { "failed" },
        ),
    ];

    let mut activity_items = vec![
        activity("activity-1", "Plan received", format!("Received approved plan: {plan_preview}"), "done"),
        activity(
            "activity-2",
            "Project detection",
            format!("package.json: {has_package_json}, src/: {has_src_dir}, src-tauri/: {has_tauri_dir}, git: {has_git}"),
            if source_ready { "done" } else { "blocked" },
        ),
        activity(
            "activity-3",
            "Tool detection",
            format!("node: {has_node}, npm: {has_npm}"),
            if verification_ready { "done" } else { "blocked" },
        ),
    ];

    if let Some(result) = git_status {
        activity_items.push(activity(
            "activity-4",
            "Git status",
            result.summary,
            if result.success { "done" } else { "blocked" },
        ));
    } else {
        activity_items.push(activity(
            "activity-4",
            "Git status",
            "No .git directory detected, so repository status was skipped.".to_string(),
            "pending",
        ));
    }

    if let Some(result) = build_result {
        activity_items.push(activity(
            "activity-5",
            "Build verification",
            result.summary,
            if result.success { "done" } else { "blocked" },
        ));
    } else {
        activity_items.push(activity(
            "activity-5",
            "Build verification",
            "Build skipped because npm or package.json is unavailable.".to_string(),
            "blocked",
        ));
    }

    activity_items.push(activity(
        "activity-6",
        "Patch target plan",
        patch_target_summary,
        if patch_targets_ready { "done" } else { "blocked" },
    ));

    activity_items.push(activity(
        "activity-7",
        "Patch execution",
        "File writes remain disabled until explicit diff preview, rollback checkpoint, and write approval are connected.".to_string(),
        "blocked",
    ));

    let message = if patch_ready && verification_ready && build_success {
        "Safe execution phase completed: repo clean/status checked, npm build passed, and patch targets were identified. Next phase is diff preview + checkpointed file writes."
    } else if verification_ready && build_success {
        "Safe verification passed, but patch target preparation is blocked. Review target detection before allowing file writes."
    } else if verification_ready {
        "Safe terminal verification ran, but npm run build failed. Do not enable patch writes until the build is stable."
    } else {
        "Safe execution phase completed project/tool checks, but build verification could not run yet."
    };

    Ok(BuilderExecutionPreviewResponse {
        backend_available: true,
        message: message.to_string(),
        tasks,
        activity: activity_items,
    })
}
