use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceState {
    pub path: String,
    pub members: Vec<WorkspaceMember>,
    pub permissions: Vec<Permission>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceMember {
    pub user_id: String,
    pub role: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub resource_id: String,
    pub action: String,
    pub allowed: bool,
}

impl Default for WorkspaceState {
    fn default() -> Self {
        WorkspaceState {
            path: "".to_string(),
            members: vec![],
            permissions: vec![],
        }
    }
}
