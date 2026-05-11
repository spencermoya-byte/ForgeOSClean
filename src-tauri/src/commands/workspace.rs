use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::workspace::WorkspaceDatabase;

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
