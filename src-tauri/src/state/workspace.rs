use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceState {
    pub path: String,
}

impl Default for WorkspaceState {
    fn default() -> Self {
        WorkspaceState {
            path: "".to_string(),
        }
    }
}
