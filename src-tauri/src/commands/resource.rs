use serde::{Deserialize, Serialize};
use tauri::State;
use std::collections::HashMap;

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
}

// In-memory storage for resources (in production, this would be a database)
// This is just for demonstration purposes
static mut RESOURCES: Option<HashMap<String, Resource>> = None;

#[tauri::command]
pub fn create_resource(
    _app_handle: tauri::AppHandle,
    request: CreateResourceRequest,
) -> Result<ResourceResponse, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    let resource = Resource {
        id: id.clone(),
        name: request.name,
        description: request.description,
        created_at: now.clone(),
        updated_at: now,
    };
    
    unsafe {
        if RESOURCES.is_none() {
            RESOURCES = Some(HashMap::new());
        }
        RESOURCES.as_mut().unwrap().insert(id, resource.clone());
    }
    
    Ok(ResourceResponse { resource })
}

#[tauri::command]
pub fn get_resources(_app_handle: tauri::AppHandle) -> Result<ResourcesResponse, String> {
    unsafe {
        if RESOURCES.is_none() {
            RESOURCES = Some(HashMap::new());
        }
        let resources: Vec<Resource> = RESOURCES.as_ref().unwrap().values().cloned().collect();
        Ok(ResourcesResponse { resources })
    }
}

#[tauri::command]
pub fn get_resource(
    _app_handle: tauri::AppHandle,
    id: String,
) -> Result<ResourceResponse, String> {
    unsafe {
        if RESOURCES.is_none() {
            RESOURCES = Some(HashMap::new());
        }
        match RESOURCES.as_ref().unwrap().get(&id) {
            Some(resource) => Ok(ResourceResponse { resource: resource.clone() }),
            None => Err("Resource not found".to_string()),
        }
    }
}

#[tauri::command]
pub fn update_resource(
    _app_handle: tauri::AppHandle,
    id: String,
    request: UpdateResourceRequest,
) -> Result<ResourceResponse, String> {
    unsafe {
        if RESOURCES.is_none() {
            RESOURCES = Some(HashMap::new());
        }
        match RESOURCES.as_mut().unwrap().get_mut(&id) {
            Some(resource) => {
                let now = chrono::Utc::now().to_rfc3339();
                if let Some(name) = request.name {
                    resource.name = name;
                }
                if let Some(description) = request.description {
                    resource.description = description;
                }
                resource.updated_at = now;
                Ok(ResourceResponse { resource: resource.clone() })
            }
            None => Err("Resource not found".to_string()),
        }
    }
}

#[tauri::command]
pub fn delete_resource(
    _app_handle: tauri::AppHandle,
    id: String,
) -> Result<(), String> {
    unsafe {
        if RESOURCES.is_none() {
            RESOURCES = Some(HashMap::new());
        }
        match RESOURCES.as_mut().unwrap().remove(&id) {
            Some(_) => Ok(()),
            None => Err("Resource not found".to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_resource() {
        let result = create_resource(
            tauri::AppHandle::default(),
            CreateResourceRequest {
                name: "Test Resource".to_string(),
                description: "Test Description".to_string(),
            },
        );
        assert!(result.is_ok());
    }
}
