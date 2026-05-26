use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct WorkspaceCreateResult {
    pub ok: bool,
    pub reason: Option<String>,
}

#[tauri::command]
pub fn vivus_ensure_workspace_structure(root_path: String) -> WorkspaceCreateResult {
    let root = Path::new(&root_path);

    if let Err(error) = fs::create_dir_all(root.join("src")) {
        return WorkspaceCreateResult {
            ok: false,
            reason: Some(error.to_string()),
        };
    }

    if let Err(error) = fs::create_dir_all(root.join(".vivus")) {
        return WorkspaceCreateResult {
            ok: false,
            reason: Some(error.to_string()),
        };
    }

    let readme = root.join("README.md");

    if !readme.exists() {
        let _ = fs::write(readme, "# Vivus Project\n\nCreated by Vivus.");
    }

    WorkspaceCreateResult {
        ok: true,
        reason: None,
    }
}
