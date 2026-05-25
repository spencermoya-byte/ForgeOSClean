use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationResult {
    pub status: String,
    pub build_passed: bool,
    pub lint_passed: bool,
    pub typecheck_passed: bool,
    pub errors: Vec<String>,
    pub rollback_available: bool,
}

pub fn run_build_verification(project_path: &str) -> VerificationResult {
    let mut errors = Vec::new();

    let build = Command::new("npm")
        .arg("run")
        .arg("build")
        .current_dir(project_path)
        .output();

    let build_passed = match build {
        Ok(output) => {
            if !output.status.success() {
                errors.push(String::from_utf8_lossy(&output.stderr).to_string());
                false
            } else {
                true
            }
        }
        Err(e) => {
            errors.push(format!("Build execution failed: {}", e));
            false
        }
    };

    VerificationResult {
        status: if build_passed {
            "VERIFIED_FIXED".into()
        } else {
            "FAILED".into()
        },
        build_passed,
        lint_passed: false,
        typecheck_passed: false,
        errors,
        rollback_available: true,
    }
}
