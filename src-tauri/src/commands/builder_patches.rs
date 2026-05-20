use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

const MAX_PATCH_BYTES: usize = 240_000;
const MAX_FILE_BYTES: u64 = 240_000;
const CHECKPOINT_DIR: &str = ".vivus/checkpoints";
const ALLOWED_EXTENSIONS: &[&str] = &[
    "css", "html", "js", "json", "jsx", "md", "rs", "toml", "ts", "tsx", "txt", "yaml", "yml",
];
const BLOCKED_DIRS: &[&str] = &[
    ".git", "node_modules", "dist", "target", ".tauri", ".next", "build", "coverage",
];

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderPatchPreviewRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "nextContent")]
    pub next_content: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderPatchApplyRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "expectedCurrentContent")]
    pub expected_current_content: String,
    #[serde(rename = "nextContent")]
    pub next_content: String,
    #[serde(rename = "approvalToken")]
    pub approval_token: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderCheckpointRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    pub files: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderRestoreCheckpointRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "checkpointId")]
    pub checkpoint_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderPatchResponse {
    pub ok: bool,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "changed")]
    pub changed: bool,
    #[serde(rename = "diffPreview")]
    pub diff_preview: String,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BuilderCheckpointResponse {
    pub ok: bool,
    #[serde(rename = "checkpointId")]
    pub checkpoint_id: Option<String>,
    pub files: Vec<String>,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

fn blocked_patch(relative_path: String, reason: String) -> BuilderPatchResponse {
    BuilderPatchResponse {
        ok: false,
        relative_path,
        changed: false,
        diff_preview: String::new(),
        blocked_reason: Some(reason),
    }
}

fn blocked_checkpoint(reason: String) -> BuilderCheckpointResponse {
    BuilderCheckpointResponse {
        ok: false,
        checkpoint_id: None,
        files: vec![],
        blocked_reason: Some(reason),
    }
}

fn resolve_project_path(project_path: &str) -> Result<PathBuf, String> {
    let requested_path = project_path.trim();
    if requested_path.is_empty() {
        return Err("Project path is empty.".to_string());
    }

    let path = PathBuf::from(requested_path);
    let absolute_path = if path.is_absolute() {
        path
    } else {
        std::env::current_dir()
            .map_err(|error| format!("Unable to resolve current working directory: {error}"))?
            .join(path)
    };

    let canonical = absolute_path
        .canonicalize()
        .map_err(|error| format!("Unable to resolve project path: {error}"))?;

    if !canonical.exists() {
        return Err("Project path does not exist.".to_string());
    }

    if !canonical.is_dir() {
        return Err("Project path is not a directory.".to_string());
    }

    Ok(canonical)
}

fn normalize_relative_path(relative_path: &str) -> Result<PathBuf, String> {
    let trimmed = relative_path.trim().trim_start_matches('/').trim_start_matches('\\');
    if trimmed.is_empty() {
        return Err("Relative path is empty.".to_string());
    }

    let mut normalized = PathBuf::new();
    for component in Path::new(trimmed).components() {
        match component {
            Component::Normal(part) => normalized.push(part),
            Component::CurDir => {}
            _ => return Err("Path traversal and absolute paths are blocked.".to_string()),
        }
    }

    Ok(normalized)
}

fn contains_blocked_dir(relative_path: &Path) -> bool {
    relative_path.components().any(|component| {
        if let Component::Normal(part) = component {
            let value = part.to_string_lossy();
            BLOCKED_DIRS.iter().any(|blocked| value.eq_ignore_ascii_case(blocked))
        } else {
            false
        }
    })
}

fn ensure_inside_project(project_root: &Path, target: &Path) -> Result<PathBuf, String> {
    let canonical_parent = target
        .parent()
        .ok_or_else(|| "Target path has no parent.".to_string())?
        .canonicalize()
        .map_err(|error| format!("Unable to resolve target parent: {error}"))?;

    if !canonical_parent.starts_with(project_root) {
        return Err("Resolved path escapes the selected project.".to_string());
    }

    Ok(canonical_parent.join(target.file_name().ok_or_else(|| "Target has no filename.".to_string())?))
}

fn is_allowed_text_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| ALLOWED_EXTENSIONS.iter().any(|allowed| extension.eq_ignore_ascii_case(allowed)))
        .unwrap_or(false)
}

fn validate_file_target(project_root: &Path, relative_path: &str) -> Result<PathBuf, String> {
    let normalized = normalize_relative_path(relative_path)?;

    if contains_blocked_dir(&normalized) {
        return Err("Blocked directory cannot be patched.".to_string());
    }

    let target = ensure_inside_project(project_root, &project_root.join(&normalized))?;

    if !target.exists() {
        return Err("Target file does not exist. New file creation is not enabled yet.".to_string());
    }

    if !target.is_file() {
        return Err("Target is not a file.".to_string());
    }

    if !is_allowed_text_file(&target) {
        return Err("Only allowlisted source/text files can be patched.".to_string());
    }

    let metadata = fs::metadata(&target).map_err(|error| format!("Unable to read file metadata: {error}"))?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err("Target file is too large for safe patching.".to_string());
    }

    Ok(target)
}

fn read_text(path: &Path) -> Result<String, String> {
    let bytes = fs::read(path).map_err(|error| format!("Unable to read file: {error}"))?;
    String::from_utf8(bytes).map_err(|_| "File is not valid UTF-8 text.".to_string())
}

fn relative_display_path(project_root: &Path, path: &Path) -> String {
    path.strip_prefix(project_root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

fn simple_diff_preview(relative_path: &str, current: &str, next: &str) -> String {
    let current_lines: Vec<&str> = current.lines().collect();
    let next_lines: Vec<&str> = next.lines().collect();
    let max_lines = current_lines.len().max(next_lines.len()).min(240);
    let mut diff = format!("--- a/{relative_path}\n+++ b/{relative_path}\n");

    for index in 0..max_lines {
        let before = current_lines.get(index);
        let after = next_lines.get(index);
        if before == after {
            continue;
        }

        diff.push_str(&format!("@@ line {} @@\n", index + 1));
        if let Some(line) = before {
            diff.push_str("-");
            diff.push_str(line);
            diff.push('\n');
        }
        if let Some(line) = after {
            diff.push_str("+");
            diff.push_str(line);
            diff.push('\n');
        }

        if diff.len() > MAX_PATCH_BYTES {
            diff.push_str("\n...diff preview truncated...\n");
            break;
        }
    }

    if diff.lines().count() <= 2 {
        diff.push_str("No textual changes detected.\n");
    }

    diff
}

fn now_id() -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    format!("checkpoint-{millis}")
}

#[tauri::command]
pub fn vivus_preview_file_patch(request: BuilderPatchPreviewRequest) -> Result<BuilderPatchResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_patch(request.relative_path, reason)),
    };

    if request.next_content.len() > MAX_PATCH_BYTES {
        return Ok(blocked_patch(request.relative_path, "Proposed content is too large for safe preview.".to_string()));
    }

    let target = match validate_file_target(&project_root, &request.relative_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_patch(request.relative_path, reason)),
    };

    let current = match read_text(&target) {
        Ok(content) => content,
        Err(reason) => return Ok(blocked_patch(relative_display_path(&project_root, &target), reason)),
    };
    let relative_path = relative_display_path(&project_root, &target);
    let diff_preview = simple_diff_preview(&relative_path, &current, &request.next_content);

    Ok(BuilderPatchResponse {
        ok: true,
        relative_path,
        changed: current != request.next_content,
        diff_preview,
        blocked_reason: None,
    })
}

#[tauri::command]
pub fn vivus_create_patch_checkpoint(request: BuilderCheckpointRequest) -> Result<BuilderCheckpointResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_checkpoint(reason)),
    };

    if request.files.is_empty() {
        return Ok(blocked_checkpoint("Checkpoint requires at least one file.".to_string()));
    }

    let checkpoint_id = now_id();
    let checkpoint_root = project_root.join(CHECKPOINT_DIR).join(&checkpoint_id);
    let mut copied = vec![];

    for file in request.files.iter().take(20) {
        let target = match validate_file_target(&project_root, file) {
            Ok(path) => path,
            Err(reason) => return Ok(blocked_checkpoint(format!("{file}: {reason}"))),
        };
        let relative = relative_display_path(&project_root, &target);
        let backup_path = checkpoint_root.join(&relative);
        if let Some(parent) = backup_path.parent() {
            fs::create_dir_all(parent).map_err(|error| format!("Unable to create checkpoint directory: {error}"))?;
        }
        fs::copy(&target, &backup_path).map_err(|error| format!("Unable to copy checkpoint file: {error}"))?;
        copied.push(relative);
    }

    Ok(BuilderCheckpointResponse {
        ok: true,
        checkpoint_id: Some(checkpoint_id),
        files: copied,
        blocked_reason: None,
    })
}

#[tauri::command]
pub fn vivus_apply_approved_file_patch(request: BuilderPatchApplyRequest) -> Result<BuilderPatchResponse, String> {
    if request.approval_token.trim() != "APPROVE_PATCH" {
        return Ok(blocked_patch(
            request.relative_path,
            "Patch application requires explicit APPROVE_PATCH token.".to_string(),
        ));
    }

    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_patch(request.relative_path, reason)),
    };

    if request.next_content.len() > MAX_PATCH_BYTES {
        return Ok(blocked_patch(request.relative_path, "Proposed content is too large for safe patching.".to_string()));
    }

    let target = match validate_file_target(&project_root, &request.relative_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_patch(request.relative_path, reason)),
    };

    let current = match read_text(&target) {
        Ok(content) => content,
        Err(reason) => return Ok(blocked_patch(relative_display_path(&project_root, &target), reason)),
    };

    if current != request.expected_current_content {
        return Ok(blocked_patch(
            relative_display_path(&project_root, &target),
            "Current file content does not match the approved base. Re-inspect before applying.".to_string(),
        ));
    }

    let relative_path = relative_display_path(&project_root, &target);
    let diff_preview = simple_diff_preview(&relative_path, &current, &request.next_content);
    fs::write(&target, request.next_content).map_err(|error| format!("Unable to write approved patch: {error}"))?;

    Ok(BuilderPatchResponse {
        ok: true,
        relative_path,
        changed: true,
        diff_preview,
        blocked_reason: None,
    })
}

#[tauri::command]
pub fn vivus_restore_patch_checkpoint(request: BuilderRestoreCheckpointRequest) -> Result<BuilderCheckpointResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_checkpoint(reason)),
    };

    if !request.checkpoint_id.starts_with("checkpoint-") {
        return Ok(blocked_checkpoint("Invalid checkpoint id.".to_string()));
    }

    let checkpoint_root = project_root.join(CHECKPOINT_DIR).join(&request.checkpoint_id);
    if !checkpoint_root.exists() || !checkpoint_root.is_dir() {
        return Ok(blocked_checkpoint("Checkpoint does not exist.".to_string()));
    }

    let mut restored = vec![];
    let mut stack = vec![checkpoint_root.clone()];

    while let Some(dir) = stack.pop() {
        for entry in fs::read_dir(&dir).map_err(|error| format!("Unable to read checkpoint directory: {error}"))? {
            let entry = entry.map_err(|error| format!("Unable to read checkpoint entry: {error}"))?;
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
                continue;
            }

            let relative = path
                .strip_prefix(&checkpoint_root)
                .map_err(|_| "Invalid checkpoint file path.".to_string())?
                .to_string_lossy()
                .replace('\\', "/");
            let target = validate_file_target(&project_root, &relative)?;
            fs::copy(&path, &target).map_err(|error| format!("Unable to restore checkpoint file: {error}"))?;
            restored.push(relative);
        }
    }

    Ok(BuilderCheckpointResponse {
        ok: true,
        checkpoint_id: Some(request.checkpoint_id),
        files: restored,
        blocked_reason: None,
    })
}
