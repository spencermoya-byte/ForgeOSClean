use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BuilderExecutionState {
    Idle,
    Planning,
    Patching,
    Verifying,
    VerifiedFixed,
    Failed,
    Rollback,
}

impl BuilderExecutionState {
    pub fn as_str(&self) -> &'static str {
        match self {
            BuilderExecutionState::Idle => "IDLE",
            BuilderExecutionState::Planning => "PLANNING",
            BuilderExecutionState::Patching => "PATCHING",
            BuilderExecutionState::Verifying => "VERIFYING",
            BuilderExecutionState::VerifiedFixed => "VERIFIED_FIXED",
            BuilderExecutionState::Failed => "FAILED",
            BuilderExecutionState::Rollback => "ROLLBACK",
        }
    }
}
