use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Instant;
use tauri::State;
use tokio::net::TcpStream;
use tokio::process::{Child, Command};
use tokio::time::{timeout, Duration};

const DEV_SERVER_URL: &str = "http://127.0.0.1:1420";
const DEV_SERVER_HOST_PORT: &str = "127.0.0.1:1420";

#[derive(Serialize, Deserialize, Clone)]
pub struct SafeCommandRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "commandId")]
    pub command_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SafeCommandResponse {
    pub ok: bool,
    #[serde(rename = "commandId")]
    pub command_id: String,
    #[serde(rename = "commandDisplay")]
    pub command_display: String,
    #[serde(rename = "exitCode")]
    pub exit_code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
    #[serde(rename = "durationMs")]
    pub duration_ms: u128,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DevServerRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DevServerResponse {
    pub ok: bool,
    pub url: String,
    pub pid: Option<u32>,
    pub status: String,
    #[serde(rename = "projectPath")]
    pub project_path: Option<String>,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

struct RunningDevServer {
    child: Child,
    pid: Option<u32>,
    project_path: String,
}

#[derive(Default)]
pub struct PreviewServerState {
    running: Mutex<Option<RunningDevServer>>,
}

struct SafeCommandDefinition {
    command_id: &'static str,
    executable: &'static str,
    args: &'static [&'static str],
    display: &'static str,
    requires_package_json: bool,
    requires_git: bool,
    timeout_seconds: u64,
}

const SAFE_COMMANDS: &[SafeCommandDefinition] = &[
    SafeCommandDefinition { command_id: "git_status", executable: "git", args: &["status", "--short"], display: "git status --short", requires_package_json: false, requires_git: true, timeout_seconds: 30 },
    SafeCommandDefinition { command_id: "git_diff_stat", executable: "git", args: &["diff", "--stat"], display: "git diff --stat", requires_package_json: false, requires_git: true, timeout_seconds: 30 },
    SafeCommandDefinition { command_id: "git_diff", executable: "git", args: &["diff"], display: "git diff", requires_package_json: false, requires_git: true, timeout_seconds: 45 },
    SafeCommandDefinition { command_id: "git_log", executable: "git", args: &["log", "--oneline", "-n", "20"], display: "git log --oneline -n 20", requires_package_json: false, requires_git: true, timeout_seconds: 30 },
    SafeCommandDefinition { command_id: "git_branch", executable: "git", args: &["branch", "--show-current"], display: "git branch --show-current", requires_package_json: false, requires_git: true, timeout_seconds: 30 },
    SafeCommandDefinition { command_id: "git_cached_diff", executable: "git", args: &["diff", "--cached"], display: "git diff --cached", requires_package_json: false, requires_git: true, timeout_seconds: 45 },
    SafeCommandDefinition { command_id: "npm_install", executable: "npm", args: &["install"], display: "npm install", requires_package_json: true, requires_git: false, timeout_seconds: 180 },
    SafeCommandDefinition { command_id: "npm_build", executable: "npm", args: &["run", "build"], display: "npm run build", requires_package_json: true, requires_git: false, timeout_seconds: 120 },
    SafeCommandDefinition { command_id: "npm_test", executable: "npm", args: &["test"], display: "npm test", requires_package_json: true, requires_git: false, timeout_seconds: 120 },
    SafeCommandDefinition { command_id: "npm_lint", executable: "npm", args: &["run", "lint"], display: "npm run lint", requires_package_json: true, requires_git: false, timeout_seconds: 120 },
    SafeCommandDefinition { command_id: "npm_typecheck", executable: "npm", args: &["run", "typecheck"], display: "npm run typecheck", requires_package_json: true, requires_git: false, timeout_seconds: 120 },
];

fn blocked_response(command_id: String, command_display: String, blocked_reason: String, duration_ms: u128) -> SafeCommandResponse {
    SafeCommandResponse { ok: false, command_id, command_display, exit_code: None, stdout: String::new(), stderr: String::new(), duration_ms, blocked_reason: Some(blocked_reason) }
}

fn dev_server_response(ok: bool, status: &str, pid: Option<u32>, project_path: Option<String>, blocked_reason: Option<String>) -> DevServerResponse {
    DevServerResponse {
        ok,
        url: if ok { DEV_SERVER_URL.to_string() } else { String::new() },
        pid,
        status: status.to_string(),
        project_path,
        blocked_reason,
    }
}

fn resolve_project_path(project_path: &str) -> Result<PathBuf, String> {
    let requested_path = project_path.trim();
    if requested_path.is_empty() { return Err("Project path is empty.".to_string()); }
    let path = PathBuf::from(requested_path);
    let absolute_path = if path.is_absolute() { path } else { std::env::current_dir().map_err(|error| format!("Unable to resolve current working directory: {error}"))?.join(path) };
    let canonical = absolute_path.canonicalize().map_err(|error| format!("Unable to resolve project path: {error}"))?;
    if !canonical.exists() { return Err("Project path does not exist.".to_string()); }
    if !canonical.is_dir() { return Err("Project path is not a directory.".to_string()); }
    Ok(canonical)
}

fn path_exists(project_root: &Path, child: &str) -> bool { project_root.join(child).exists() }

async fn executable_available(executable: &str) -> bool { Command::new(executable).arg("--version").output().await.is_ok() }

async fn dev_server_port_is_open() -> bool {
    timeout(Duration::from_millis(400), TcpStream::connect(DEV_SERVER_HOST_PORT)).await.is_ok()
}

#[tauri::command]
pub async fn vivus_run_safe_command(request: SafeCommandRequest) -> Result<SafeCommandResponse, String> {
    let started = Instant::now();
    let command_id = request.command_id.trim().to_string();
    let Some(definition) = SAFE_COMMANDS.iter().find(|command| command.command_id == command_id) else {
        return Ok(blocked_response(command_id, "blocked command".to_string(), "Unknown command_id. Vivus only supports allowlisted project commands.".to_string(), started.elapsed().as_millis()));
    };

    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_response(command_id, definition.display.to_string(), reason, started.elapsed().as_millis())),
    };

    if definition.requires_package_json && !path_exists(&project_root, "package.json") {
        return Ok(blocked_response(command_id, definition.display.to_string(), "Blocked because package.json was not found in the selected project.".to_string(), started.elapsed().as_millis()));
    }

    if definition.requires_git && !path_exists(&project_root, ".git") {
        return Ok(blocked_response(command_id, definition.display.to_string(), "Blocked because .git was not found in the selected project.".to_string(), started.elapsed().as_millis()));
    }

    if !executable_available(definition.executable).await {
        return Ok(blocked_response(command_id, definition.display.to_string(), format!("Blocked because {} is not available on this machine.", definition.executable), started.elapsed().as_millis()));
    }

    let mut command = Command::new(definition.executable);
    command.args(definition.args).current_dir(project_root);
    let command_result = timeout(Duration::from_secs(definition.timeout_seconds), command.output()).await;

    match command_result {
        Err(_) => Ok(SafeCommandResponse { ok: false, command_id, command_display: definition.display.to_string(), exit_code: None, stdout: String::new(), stderr: format!("Command timed out after {} seconds.", definition.timeout_seconds), duration_ms: started.elapsed().as_millis(), blocked_reason: Some("Command timed out and was stopped by the Vivus safety runner.".to_string()) }),
        Ok(Err(error)) => Ok(SafeCommandResponse { ok: false, command_id, command_display: definition.display.to_string(), exit_code: None, stdout: String::new(), stderr: error.to_string(), duration_ms: started.elapsed().as_millis(), blocked_reason: Some("Command failed to start.".to_string()) }),
        Ok(Ok(output)) => Ok(SafeCommandResponse { ok: output.status.success(), command_id, command_display: definition.display.to_string(), exit_code: output.status.code(), stdout: String::from_utf8_lossy(&output.stdout).to_string(), stderr: String::from_utf8_lossy(&output.stderr).to_string(), duration_ms: started.elapsed().as_millis(), blocked_reason: None }),
    }
}

#[tauri::command]
pub async fn vivus_start_dev_server(request: DevServerRequest, state: State<'_, PreviewServerState>) -> Result<DevServerResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(dev_server_response(false, "failed", None, None, Some(reason))),
    };

    let canonical_project_path = project_root.to_string_lossy().to_string();

    {
        let mut running = state.running.lock().map_err(|_| "Preview server state lock failed.".to_string())?;

        if let Some(server) = running.as_mut() {
            match server.child.try_wait() {
                Ok(None) if server.project_path == canonical_project_path => {
                    return Ok(dev_server_response(true, "running", server.pid, Some(server.project_path.clone()), None));
                }
                Ok(None) => {
                    return Ok(dev_server_response(
                        false,
                        "blocked",
                        server.pid,
                        Some(server.project_path.clone()),
                        Some("A preview server is already running for a different project folder. Stop it before starting another preview.".to_string()),
                    ));
                }
                Ok(Some(_)) | Err(_) => {
                    *running = None;
                }
            }
        }
    }

    if dev_server_port_is_open().await {
        return Ok(dev_server_response(true, "running", None, Some(canonical_project_path), None));
    }

    if !path_exists(&project_root, "package.json") {
        return Ok(dev_server_response(false, "failed", None, Some(canonical_project_path), Some("Blocked because package.json was not found in the selected project.".to_string())));
    }

    if !executable_available("npm").await {
        return Ok(dev_server_response(false, "failed", None, Some(canonical_project_path), Some("Blocked because npm is not available on this machine.".to_string())));
    }

    let mut command = Command::new("npm");
    command.args(["run", "dev", "--", "--host", "127.0.0.1", "--port", "1420"])
        .current_dir(&project_root)
        .kill_on_drop(false);

    match command.spawn() {
        Ok(child) => {
            let pid = child.id();
            let mut running = state.running.lock().map_err(|_| "Preview server state lock failed.".to_string())?;
            *running = Some(RunningDevServer { child, pid, project_path: canonical_project_path.clone() });
            Ok(dev_server_response(true, "starting", pid, Some(canonical_project_path), None))
        }
        Err(error) => Ok(dev_server_response(false, "failed", None, Some(canonical_project_path), Some(format!("Failed to start dev server: {error}")))),
    }
}

#[tauri::command]
pub async fn vivus_stop_dev_server(state: State<'_, PreviewServerState>) -> Result<DevServerResponse, String> {
    let server = {
        let mut running = state.running.lock().map_err(|_| "Preview server state lock failed.".to_string())?;
        running.take()
    };

    let Some(mut server) = server else {
        return Ok(dev_server_response(true, "stopped", None, None, None));
    };

    let project_path = server.project_path.clone();
    let pid = server.pid;

    match server.child.kill().await {
        Ok(_) => Ok(dev_server_response(true, "stopped", pid, Some(project_path), None)),
        Err(error) => Ok(dev_server_response(false, "failed", pid, Some(project_path), Some(format!("Failed to stop dev server: {error}")))),
    }
}

#[tauri::command]
pub async fn vivus_dev_server_status(state: State<'_, PreviewServerState>) -> Result<DevServerResponse, String> {
    let mut running = state.running.lock().map_err(|_| "Preview server state lock failed.".to_string())?;

    if let Some(server) = running.as_mut() {
        match server.child.try_wait() {
            Ok(None) => return Ok(dev_server_response(true, "running", server.pid, Some(server.project_path.clone()), None)),
            Ok(Some(_)) | Err(_) => {
                *running = None;
            }
        }
    }

    Ok(dev_server_response(true, "stopped", None, None, None))
}
