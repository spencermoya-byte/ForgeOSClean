use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::sync::SyncDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncContext {
    pub is_online: bool,
    pub last_sync: Option<String>,
    pub pending_items: u32,
    pub sync_progress: f32,
    pub device_id: String,
    pub device_name: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncRequest {
    pub resource_id: String,
    pub operation: String,
    pub payload: String,
    pub priority: Option<u32>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncResponse {
    pub success: bool,
    pub message: String,
    pub sync_id: Option<String>,
}

#[tauri::command]
pub async fn get_sync_context(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<SyncContext, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    // Get device info
    let device_id = "current_device".to_string();
    let device_metadata = sync_db.get_device_metadata(&device_id)
        .await
        .map_err(|e| format!("Failed to get device info: {}", e))?;
    
    let device_name = device_metadata
        .map(|d| d.device_name)
        .unwrap_or_else(|| "Unknown Device".to_string());
    
    // Get pending items count
    let pending_items = sync_db.get_sync_queue_items(Some("pending"), None)
        .await
        .map_err(|e| format!("Failed to get sync queue items: {}", e))?
        .len() as u32;
    
    // Mock sync status - in a real implementation this would check actual connection
    let context = SyncContext {
        is_online: true,
        last_sync: Some(chrono::Utc::now().to_rfc3339()),
        pending_items,
        sync_progress: 0.0,
        device_id,
        device_name,
    };
    
    Ok(context)
}

#[tauri::command]
pub async fn queue_ai_sync_request(
    db: State<'_, sqlx::SqlitePool>,
    request: SyncRequest,
) -> Result<SyncResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    let item = crate::database::sync::SyncQueueItem {
        id: uuid::Uuid::new_v4().to_string(),
        resource_id: request.resource_id,
        workspace_id: "".to_string(), // This would be populated from context
        project_id: "".to_string(),   // This would be populated from context
        operation: request.operation,
        payload: request.payload,
        status: "pending".to_string(),
        priority: request.priority.unwrap_or(0) as i32,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match sync_db.add_sync_queue_item(item).await {
        Ok(_) => Ok(SyncResponse {
            success: true,
            message: "AI sync request queued successfully".to_string(),
            sync_id: None,
        }),
        Err(e) => Err(format!("Failed to queue AI sync request: {}", e)),
    }
}
