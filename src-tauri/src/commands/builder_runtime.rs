use crate::commands::builder_guardrails::validate_safe_write_path;
use crate::commands::builder_verification::{run_build_verification, VerificationResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuilderRuntimeResult {
    pub allowed: bool,
    pub verification: Option<VerificationResult>,
    pub message: String,
}

#[tauri::command]
pub fn vivus_validate_patch_target(path: String) -> Result<BuilderRuntimeResult, String> {
    match validate_safe_write_path(&path) {
        Ok(_) => Ok(BuilderRuntimeResult {
            allowed: true,
            verification: None,
            message: "Patch target approved".into(),
        }),
        Err(e) => Ok(BuilderRuntimeResult {
            allowed: false,
            verification: None,
            message: e,
        }),
    }
}

#[tauri::command]
pub fn vivus_verify_project(project_path: String) -> Result<VerificationResult, String> {
    Ok(run_build_verification(&project_path))
}
