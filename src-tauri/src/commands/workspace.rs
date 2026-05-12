use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::workspace::WorkspaceDatabase;
use crate::database::collaboration::{CollaborationDatabase, WorkspaceMember};

#[derive(Serialize, Deserialize, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub description: String,
    pub path: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateWorkspaceRequest {
    pub name: String,
    pub description: String,
    pub path: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateWorkspaceRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub path: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkspaceResponse {
    pub workspace: Workspace,
}

#[derive(Serialize, Deserialize)]
pub struct WorkspacesResponse {
    pub workspaces: Vec<Workspace>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkspaceMemberResponse {
    pub member: WorkspaceMember,
}

#[derive(Serialize, Deserialize)]
pub struct WorkspaceMembersResponse {
    pub members: Vec<WorkspaceMember>,
}

#[tauri::command]
pub async fn create_workspace(
    db: State<'_, sqlx::SqlitePool>,
    request: CreateWorkspaceRequest,
) -> Result<WorkspaceResponse, String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.create_workspace(request).await {
        Ok(workspace) => Ok(WorkspaceResponse { workspace }),
        Err(e) => Err(format!("Failed to create workspace: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workspaces(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<WorkspacesResponse, String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.get_workspaces().await {
        Ok(workspaces) => Ok(WorkspacesResponse { workspaces }),
        Err(e) => Err(format!("Failed to get workspaces: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workspace(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<WorkspaceResponse, String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.get_workspace(&id).await {
        Ok(workspace) => Ok(WorkspaceResponse { workspace }),
        Err(e) => Err(format!("Failed to get workspace: {}", e)),
    }
}

#[tauri::command]
pub async fn update_workspace(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdateWorkspaceRequest,
) -> Result<WorkspaceResponse, String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.update_workspace(&id, request).await {
        Ok(workspace) => Ok(WorkspaceResponse { workspace }),
        Err(e) => Err(format!("Failed to update workspace: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_workspace(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.delete_workspace(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete workspace: {}", e)),
    }
}

#[tauri::command]
pub async fn set_active_workspace(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.set_active_workspace(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to set active workspace: {}", e)),
    }
}

#[tauri::command]
pub async fn get_active_workspace(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Option<WorkspaceResponse>, String> {
    let workspace_db = WorkspaceDatabase::new(db.inner().clone());
    match workspace_db.get_active_workspace().await {
        Ok(Some(workspace)) => Ok(Some(WorkspaceResponse { workspace })),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to get active workspace: {}", e)),
    }
}

// Collaboration commands
#[tauri::command]
pub async fn get_workspace_members(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
) -> Result<WorkspaceMembersResponse, String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    match collaboration_db.get_workspace_members(&workspace_id).await {
        Ok(members) => Ok(WorkspaceMembersResponse { members }),
        Err(e) => Err(format!("Failed to get workspace members: {}", e)),
    }
}

#[tauri::command]
pub async fn add_workspace_member(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
    user_id: String,
    role: String,
) -> Result<WorkspaceMemberResponse, String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    
    let member = WorkspaceMember {
        id: uuid::Uuid::new_v4().to_string(),
        workspace_id,
        user_id,
        role,
        is_active: true,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match collaboration_db.add_workspace_member(member).await {
        Ok(member) => Ok(WorkspaceMemberResponse { member }),
        Err(e) => Err(format!("Failed to add workspace member: {}", e)),
    }
}

#[tauri::command]
pub async fn update_workspace_member(
    db: State<'_, sqlx::SqlitePool>,
    member_id: String,
    role: String,
) -> Result<WorkspaceMemberResponse, String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    match collaboration_db.update_workspace_member(&member_id, &role).await {
        Ok(member) => Ok(WorkspaceMemberResponse { member }),
        Err(e) => Err(format!("Failed to update workspace member: {}", e)),
    }
}

#[tauri::command]
pub async fn remove_workspace_member(
    db: State<'_, sqlx::SqlitePool>,
    member_id: String,
) -> Result<(), String> {
    let collaboration_db = CollaborationDatabase::new(db.inner().clone());
    match collaboration_db.remove_workspace_member(&member_id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to remove workspace member: {}", e)),
    }
}
