use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tokio::process::Command;

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

fn repo_root() -> Result<PathBuf, String> {
    std::env::current_dir().map_err(|error| format!("Unable to resolve current working directory: {error}"))
}

fn exists(path: &Path) -> bool {
    std::fs::metadata(path).is_ok()
}

async fn command_available(command: &str, arg: &str) -> bool {
    Command::new(command).arg(arg).output().await.is_ok()
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

    let tasks = vec![
        BuilderExecutionTask {
            id: "task-1".to_string(),
            title: "Analyze the request and convert it into acceptance criteria".to_string(),
            status: "done".to_string(),
        },
        BuilderExecutionTask {
            id: "task-2".to_string(),
            title: "Find the relevant project files and verify current source state".to_string(),
            status: if source_ready { "done" } else { "failed" }.to_string(),
        },
        BuilderExecutionTask {
            id: "task-3".to_string(),
            title: "Prepare safe minimal patch execution".to_string(),
            status: if source_ready { "running" } else { "queued" }.to_string(),
        },
        BuilderExecutionTask {
            id: "task-4".to_string(),
            title: "Run build/type verification".to_string(),
            status: if verification_ready { "queued" } else { "failed" }.to_string(),
        },
        BuilderExecutionTask {
            id: "task-5".to_string(),
            title: "Report verified result or stop with failure details".to_string(),
            status: "queued".to_string(),
        },
    ];

    let activity = vec![
        BuilderExecutionActivity {
            id: "activity-1".to_string(),
            label: "Plan received".to_string(),
            detail: format!("Received approved plan: {plan_preview}"),
            status: "done".to_string(),
        },
        BuilderExecutionActivity {
            id: "activity-2".to_string(),
            label: "Project detection".to_string(),
            detail: format!("package.json: {has_package_json}, src/: {has_src_dir}, src-tauri/: {has_tauri_dir}, git: {has_git}"),
            status: if source_ready { "done" } else { "blocked" }.to_string(),
        },
        BuilderExecutionActivity {
            id: "activity-3".to_string(),
            label: "Tool detection".to_string(),
            detail: format!("node: {has_node}, npm: {has_npm}"),
            status: if verification_ready { "done" } else { "blocked" }.to_string(),
        },
        BuilderExecutionActivity {
            id: "activity-4".to_string(),
            label: "Patch execution".to_string(),
            detail: "File writes remain disabled in preview mode until the safety/approval layer is connected.".to_string(),
            status: "blocked".to_string(),
        },
        BuilderExecutionActivity {
            id: "activity-5".to_string(),
            label: "Build verification".to_string(),
            detail: if verification_ready {
                "Ready to run npm verification after patch execution is enabled.".to_string()
            } else {
                "Cannot verify until npm and package.json are available.".to_string()
            },
            status: if verification_ready { "pending" } else { "blocked" }.to_string(),
        },
    ];

    Ok(BuilderExecutionPreviewResponse {
        backend_available: true,
        message: "Tauri backend execution preview completed. Project/tool detection is live; file writes and terminal build execution remain gated for the next safety pass.".to_string(),
        tasks,
        activity,
    })
}
