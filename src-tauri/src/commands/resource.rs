use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::resource::ResourceDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateResourceRequest {
    pub name: String,
    pub description: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateResourceRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ResourceResponse {
    pub resource: Resource,
}

#[derive(Serialize, Deserialize)]
pub struct ResourcesResponse {
    pub resources: Vec<Resource>,
    pub total: i64,
}

#[tauri::command]
pub async fn create_resource(
    db: State<'_, sqlx::SqlitePool>,
    request: CreateResourceRequest,
) -> Result<ResourceResponse, String> {
    let resource_db = ResourceDatabase::new(db.inner().clone());
    match resource_db.create_resource(request).await {
        Ok(resource) => Ok(ResourceResponse { resource }),
        Err(e) => Err(format!("Failed to create resource: {}", e)),
    }
}

#[tauri::command]
pub async fn get_resources(
    db: State<'_, sqlx::SqlitePool>,
    filters: Option<String>,
    sort_by: Option<String>,
    sort_order: Option<String>,
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<ResourcesResponse, String> {
    let resource_db = ResourceDatabase::new(db.inner().clone());
    
    let filters = filters.unwrap_or_default();
    let sort_by = sort_by.unwrap_or_else(|| "created_at".to_string());
    let sort_order = sort_order.unwrap_or_else(|| "DESC".to_string());
    let limit = limit.unwrap_or(20);
    let offset = offset.unwrap_or(0);
    
    match resource_db.get_resources_with_filters(&filters, &sort_by, &sort_order, limit, offset).await {
        Ok(resources) => {
            let total = resource_db.get_resource_count(&filters).await.unwrap_or(0);
            Ok(ResourcesResponse { resources, total })
        }
        Err(e) => Err(format!("Failed to get resources: {}", e)),
    }
}

#[tauri::command]
pub async fn get_resource(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<ResourceResponse, String> {
    let resource_db = ResourceDatabase::new(db.inner().clone());
    match resource_db.get_resource(&id).await {
        Ok(resource) => Ok(ResourceResponse { resource }),
        Err(e) => Err(format!("Failed to get resource: {}", e)),
    }
}

#[tauri::command]
pub async fn update_resource(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdateResourceRequest,
) -> Result<ResourceResponse, String> {
    let resource_db = ResourceDatabase::new(db.inner().clone());
    match resource_db.update_resource(&id, request).await {
        Ok(resource) => Ok(ResourceResponse { resource }),
        Err(e) => Err(format!("Failed to update resource: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_resource(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let resource_db = ResourceDatabase::new(db.inner().clone());
    match resource_db.delete_resource(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete resource: {}", e)),
    }
}
