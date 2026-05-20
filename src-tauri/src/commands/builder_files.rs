use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Component, Path, PathBuf};

const MAX_FILE_BYTES: u64 = 160_000;
const MAX_LIST_ENTRIES: usize = 200;
const ALLOWED_EXTENSIONS: &[&str] = &[
    "css", "html", "js", "json", "jsx", "md", "rs", "toml", "ts", "tsx", "txt", "yaml", "yml",
];
const BLOCKED_DIRS: &[&str] = &[
    ".git", "node_modules", "dist", "target", ".tauri", ".next", "build", "coverage",
];

#[derive(Serialize, Deserialize, Clone)]
pub struct FileInspectionRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProjectTreeRequest {
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProjectTreeEntry {
    pub name: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "entryType")]
    pub entry_type: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: Option<u64>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProjectTreeResponse {
    pub ok: bool,
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    pub entries: Vec<ProjectTreeEntry>,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FileInspectionResponse {
    pub ok: bool,
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: Option<u64>,
    pub content: String,
    #[serde(rename = "truncated")]
    pub truncated: bool,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

fn blocked_tree(project_path: String, relative_path: String, reason: String) -> ProjectTreeResponse {
    ProjectTreeResponse {
        ok: false,
        project_path,
        relative_path,
        entries: vec![],
        blocked_reason: Some(reason),
    }
}

fn blocked_file(project_path: String, relative_path: String, reason: String) -> FileInspectionResponse {
    FileInspectionResponse {
        ok: false,
        project_path,
        relative_path,
        size_bytes: None,
        content: String::new(),
        truncated: false,
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
    let canonical = target
        .canonicalize()
        .map_err(|error| format!("Unable to resolve target path: {error}"))?;

    if !canonical.starts_with(project_root) {
        return Err("Resolved path escapes the selected project.".to_string());
    }

    Ok(canonical)
}

fn is_allowed_text_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| ALLOWED_EXTENSIONS.iter().any(|allowed| extension.eq_ignore_ascii_case(allowed)))
        .unwrap_or(false)
}

fn relative_display_path(project_root: &Path, path: &Path) -> String {
    path.strip_prefix(project_root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

#[tauri::command]
pub fn vivus_list_project_tree(request: ProjectTreeRequest) -> Result<ProjectTreeResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_tree(request.project_path, request.relative_path.unwrap_or_default(), reason)),
    };

    let relative_path = request.relative_path.unwrap_or_default();
    let normalized_relative = match normalize_relative_path(&relative_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_tree(project_root.to_string_lossy().to_string(), relative_path, reason)),
    };

    if contains_blocked_dir(&normalized_relative) {
        return Ok(blocked_tree(
            project_root.to_string_lossy().to_string(),
            relative_path,
            "Blocked directory is not readable through the Builder file inspector.".to_string(),
        ));
    }

    let target = match ensure_inside_project(&project_root, &project_root.join(&normalized_relative)) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_tree(project_root.to_string_lossy().to_string(), relative_path, reason)),
    };

    if !target.is_dir() {
        return Ok(blocked_tree(
            project_root.to_string_lossy().to_string(),
            relative_display_path(&project_root, &target),
            "Target is not a directory.".to_string(),
        ));
    }

    let mut entries = vec![];
    let read_dir = fs::read_dir(&target).map_err(|error| format!("Unable to read project directory: {error}"))?;

    for entry in read_dir.take(MAX_LIST_ENTRIES) {
        let entry = entry.map_err(|error| format!("Unable to read directory entry: {error}"))?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if BLOCKED_DIRS.iter().any(|blocked| name.eq_ignore_ascii_case(blocked)) {
            continue;
        }

        let metadata = entry.metadata().map_err(|error| format!("Unable to read entry metadata: {error}"))?;
        let entry_type = if metadata.is_dir() { "directory" } else { "file" }.to_string();
        entries.push(ProjectTreeEntry {
            name,
            relative_path: relative_display_path(&project_root, &path),
            entry_type,
            size_bytes: if metadata.is_file() { Some(metadata.len()) } else { None },
        });
    }

    entries.sort_by(|a, b| a.entry_type.cmp(&b.entry_type).then(a.name.cmp(&b.name)));

    Ok(ProjectTreeResponse {
        ok: true,
        project_path: project_root.to_string_lossy().to_string(),
        relative_path: relative_display_path(&project_root, &target),
        entries,
        blocked_reason: None,
    })
}

#[tauri::command]
pub fn vivus_read_project_file(request: FileInspectionRequest) -> Result<FileInspectionResponse, String> {
    let project_root = match resolve_project_path(&request.project_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_file(request.project_path, request.relative_path, reason)),
    };

    let normalized_relative = match normalize_relative_path(&request.relative_path) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_file(project_root.to_string_lossy().to_string(), request.relative_path, reason)),
    };

    if contains_blocked_dir(&normalized_relative) {
        return Ok(blocked_file(
            project_root.to_string_lossy().to_string(),
            request.relative_path,
            "Blocked directory is not readable through the Builder file inspector.".to_string(),
        ));
    }

    let target = match ensure_inside_project(&project_root, &project_root.join(&normalized_relative)) {
        Ok(path) => path,
        Err(reason) => return Ok(blocked_file(project_root.to_string_lossy().to_string(), request.relative_path, reason)),
    };

    if !target.is_file() {
        return Ok(blocked_file(
            project_root.to_string_lossy().to_string(),
            relative_display_path(&project_root, &target),
            "Target is not a file.".to_string(),
        ));
    }

    if !is_allowed_text_file(&target) {
        return Ok(blocked_file(
            project_root.to_string_lossy().to_string(),
            relative_display_path(&project_root, &target),
            "Only common source/text files can be inspected.".to_string(),
        ));
    }

    let metadata = fs::metadata(&target).map_err(|error| format!("Unable to read file metadata: {error}"))?;
    let bytes = fs::read(&target).map_err(|error| format!("Unable to read file: {error}"))?;
    let truncated = metadata.len() > MAX_FILE_BYTES;
    let limited = if truncated { &bytes[..MAX_FILE_BYTES as usize] } else { &bytes[..] };
    let content = String::from_utf8(limited.to_vec()).map_err(|_| "File is not valid UTF-8 text.".to_string())?;

    Ok(FileInspectionResponse {
        ok: true,
        project_path: project_root.to_string_lossy().to_string(),
        relative_path: relative_display_path(&project_root, &target),
        size_bytes: Some(metadata.len()),
        content,
        truncated,
        blocked_reason: None,
    })
}
