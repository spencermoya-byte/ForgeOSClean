use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::project::ProjectDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub description: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub workspace_id: String,
    pub name: String,
    pub description: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateProjectRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct ProjectResponse {
    pub project: Project,
}

#[derive(Serialize, Deserialize)]
pub struct ProjectsResponse {
    pub projects: Vec<Project>,
}

#[tauri::command]
pub async fn create_project(
    db: State<'_, sqlx::SqlitePool>,
    request: CreateProjectRequest,
) -> Result<ProjectResponse, String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.create_project(request).await {
        Ok(project) => Ok(ProjectResponse { project }),
        Err(e) => Err(format!("Failed to create project: {}", e)),
    }
}

#[tauri::command]
pub async fn get_projects(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
) -> Result<ProjectsResponse, String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.get_projects(&workspace_id).await {
        Ok(projects) => Ok(ProjectsResponse { projects }),
        Err(e) => Err(format!("Failed to get projects: {}", e)),
    }
}

#[tauri::command]
pub async fn get_project(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<ProjectResponse, String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.get_project(&id).await {
        Ok(project) => Ok(ProjectResponse { project }),
        Err(e) => Err(format!("Failed to get project: {}", e)),
    }
}

#[tauri::command]
pub async fn update_project(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdateProjectRequest,
) -> Result<ProjectResponse, String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.update_project(&id, request).await {
        Ok(project) => Ok(ProjectResponse { project }),
        Err(e) => Err(format!("Failed to update project: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_project(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.delete_project(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete project: {}", e)),
    }
}

#[tauri::command]
pub async fn set_active_project(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.set_active_project(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to set active project: {}", e)),
    }
}

#[tauri::command]
pub async fn get_active_project(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Option<ProjectResponse>, String> {
    let project_db = ProjectDatabase::new(db.inner().clone());
    match project_db.get_active_project().await {
        Ok(Some(project)) => Ok(Some(ProjectResponse { project })),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to get active project: {}", e)),
    }
}
