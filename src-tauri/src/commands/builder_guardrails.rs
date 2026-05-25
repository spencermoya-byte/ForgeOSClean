use std::path::{Component, Path};

const PROTECTED_PATHS: &[&str] = &[
    ".git",
    "node_modules",
    ".vivus",
    "target",
    "dist",
];

pub fn is_protected_path(path: &str) -> bool {
    let normalized = Path::new(path);

    normalized.components().any(|component| {
        match component {
            Component::Normal(segment) => {
                let segment = segment.to_string_lossy();
                PROTECTED_PATHS.contains(&segment.as_ref())
            }
            _ => false,
        }
    })
}

pub fn validate_safe_write_path(path: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("Parent directory traversal blocked".to_string());
    }

    if is_protected_path(path) {
        return Err(format!("Protected path blocked: {}", path));
    }

    if path.ends_with("Cargo.toml") {
        return Err("Cargo.toml mutation blocked".to_string());
    }

    if path.ends_with("package.json") {
        return Err("package.json mutation requires approval".to_string());
    }

    Ok(())
}
