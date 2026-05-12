use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::collaboration::{CollaborationDatabase, ActivityLogEntry};

#[derive(Serialize, Deserialize, Clone)]
pub struct CollaborationContext {
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub resource_id: Option<String>,
    pub user_id: String,
    pub members: Vec<WorkspaceMember>,
    pub activity_log: Vec<ActivityLogEntry>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WorkspaceMember {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ActivityLogRequest {
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub resource_id: Option<String>,
    pub user_id: String,
    pub action: String,
    pub details: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ActivityLogResponse {
    pub activity: ActivityLogEntry,
}

#[tauri::command]
pub async fn log_activity(
    db: State<'_, sqlx::SqlitePool>,
    request: ActivityLogRequest,
) -> Result<ActivityLogResponse, String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    
    let activity = ActivityLogEntry {
        id: uuid::Uuid::new_v4().to_string(),
        workspace_id: request.workspace_id.unwrap_or_default(),
        project_id: request.project_id.unwrap_or_default(),
        resource_id: request.resource_id.unwrap_or_default(),
        user_id: request.user_id,
        action: request.action,
        details: request.details,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match collaboration_db.log_activity(activity).await {
        Ok(activity) => Ok(ActivityLogResponse { activity }),
        Err(e) => Err(format!("Failed to log activity: {}", e)),
    }
}

#[tauri::command]
pub async fn get_activity_log(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: Option<String>,
    project_id: Option<String>,
    resource_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<ActivityLogEntry>, String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    match collaboration_db.get_activity_log(workspace_id.as_deref(), project_id.as_deref(), resource_id.as_deref(), limit).await {
        Ok(activities) => Ok(activities),
        Err(e) => Err(format!("Failed to get activity log: {}", e)),
    }
}
