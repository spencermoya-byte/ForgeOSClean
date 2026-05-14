use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tauri::State;

use crate::database::marketplace::MarketplaceDatabase;
use crate::state::marketplace::{Extension, ExtensionInstallationRequest, ExtensionUpdateRequest, ExtensionLifecycleEventType};

#[derive(Serialize, Deserialize)]
pub struct SearchExtensionsRequest {
    pub query: String,
    pub category: Option<String>,
    pub author: Option<String>,
    pub page: u32,
    pub limit: u32,
}

#[derive(Serialize, Deserialize)]
pub struct SearchExtensionsResponse {
    pub extensions: Vec<Extension>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
}

#[tauri::command]
pub async fn search_extensions(
    db: State<'_, SqlitePool>,
    request: SearchExtensionsRequest,
) -> Result<SearchExtensionsResponse, String> {
    let db = MarketplaceDatabase::new(db);
    
    // Handle empty query by returning all extensions
    if request.query.trim().is_empty() {
        let extensions = db.get_all_extensions().await.map_err(|e| e.to_string())?;
        return Ok(SearchExtensionsResponse {
            extensions,
            total: extensions.len() as u64,
            page: request.page,
            limit: request.limit,
        });
    }
    
    // For now, we'll just return all extensions
    // In a real implementation, this would filter based on the search query
    let extensions = db.get_all_extensions().await.map_err(|e| e.to_string())?;
    
    Ok(SearchExtensionsResponse {
        extensions,
        total: extensions.len() as u64,
        page: request.page,
        limit: request.limit,
    })
}

#[tauri::command]
pub async fn install_extension(
    db: State<'_, SqlitePool>,
    request: ExtensionInstallationRequest,
) -> Result<Extension, String> {
    let db = MarketplaceDatabase::new(db);
    
    db.install_extension(request).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_extension_configuration(
    db: State<'_, SqlitePool>,
    extension_id: String,
) -> Result<serde_json::Value, String> {
    let db = MarketplaceDatabase::new(db);
    
    db.get_extension_configuration(&extension_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_extension_configuration(
    db: State<'_, SqlitePool>,
    extension_id: String,
    configuration: serde_json::Value,
) -> Result<(), String> {
    let db = MarketplaceDatabase::new(db);
    
    db.update_extension_configuration(&extension_id, configuration)
        .await
        .map_err(|e| e.to_string())
}
