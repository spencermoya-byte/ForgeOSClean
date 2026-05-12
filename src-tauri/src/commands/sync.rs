use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::sync::{SyncDatabase, SyncMetadata, SyncQueueItem, DeviceMetadata};

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncStatus {
    pub is_online: bool,
    pub last_sync: Option<String>,
    pub pending_items: u32,
    pub sync_progress: f32,
    pub sync_error: Option<String>,
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

#[derive(Serialize, Deserialize, Clone)]
pub struct DeviceInfo {
    pub id: String,
    pub device_name: String,
    pub device_type: String,
    pub platform: String,
    pub last_seen: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncHistoryItem {
    pub id: String,
    pub resource_id: String,
    pub workspace_id: String,
    pub project_id: String,
    pub operation: String,
    pub status: String,
    pub sync_time: String,
    pub version: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct SyncStatusResponse {
    pub status: SyncStatus,
}

#[derive(Serialize, Deserialize)]
pub struct SyncHistoryResponse {
    pub history: Vec<SyncHistoryItem>,
}

#[derive(Serialize, Deserialize)]
pub struct DeviceInfoResponse {
    pub device: DeviceInfo,
}

#[tauri::command]
pub async fn get_sync_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<SyncStatusResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    // Get pending items count
    let pending_items = sync_db.get_sync_queue_items(Some("pending"), None)
        .await
        .map_err(|e| format!("Failed to get sync queue items: {}", e))?
        .len() as u32;
    
    // Mock sync status - in a real implementation this would check actual connection
    let status = SyncStatus {
        is_online: true,
        last_sync: Some(chrono::Utc::now().to_rfc3339()),
        pending_items,
        sync_progress: 0.0,
        sync_error: None,
    };
    
    Ok(SyncStatusResponse { status })
}

#[tauri::command]
pub async fn queue_sync_request(
    db: State<'_, sqlx::SqlitePool>,
    request: SyncRequest,
) -> Result<SyncResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    let item = SyncQueueItem {
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
            message: "Sync request queued successfully".to_string(),
            sync_id: None,
        }),
        Err(e) => Err(format!("Failed to queue sync request: {}", e)),
    }
}

#[tauri::command]
pub async fn get_sync_history(
    db: State<'_, sqlx::SqlitePool>,
    resource_id: Option<String>,
    limit: Option<u32>,
) -> Result<SyncHistoryResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    let history = sync_db.get_sync_history(resource_id.as_deref(), limit)
        .await
        .map_err(|e| format!("Failed to get sync history: {}", e))?;
    
    // Convert to response format
    let history_items: Vec<SyncHistoryItem> = history.into_iter().map(|item| {
        SyncHistoryItem {
            id: item.id,
            resource_id: item.resource_id,
            workspace_id: item.workspace_id,
            project_id: item.project_id,
            operation: "unknown".to_string(), // This would be stored in sync_history table
            status: item.sync_status,
            sync_time: item.last_synced,
            version: item.version,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }
    }).collect();
    
    Ok(SyncHistoryResponse { history: history_items })
}

#[tauri::command]
pub async fn get_device_info(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<DeviceInfoResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    // Get or create device metadata
    let device_id = "current_device".to_string(); // In real implementation, this would be a unique device ID
    
    let device_metadata = sync_db.get_device_metadata(&device_id)
        .await
        .map_err(|e| format!("Failed to get device info: {}", e))?;
    
    let device = if let Some(metadata) = device_metadata {
        DeviceInfo {
            id: metadata.id,
            device_name: metadata.device_name,
            device_type: metadata.device_type,
            platform: metadata.platform,
            last_seen: metadata.last_seen,
            is_active: metadata.is_active,
        }
    } else {
        // Create new device metadata
        let new_device = DeviceMetadata {
            id: device_id.clone(),
            device_name: "Current Device".to_string(),
            device_type: "desktop".to_string(),
            platform: std::env::consts::OS.to_string(),
            last_seen: chrono::Utc::now().to_rfc3339(),
            is_active: true,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        };
        
        let saved_device = sync_db.update_device_metadata(new_device)
            .await
            .map_err(|e| format!("Failed to create device info: {}", e))?;
        
        DeviceInfo {
            id: saved_device.id,
            device_name: saved_device.device_name,
            device_type: saved_device.device_type,
            platform: saved_device.platform,
            last_seen: saved_device.last_seen,
            is_active: saved_device.is_active,
        }
    };
    
    Ok(DeviceInfoResponse { device })
}

#[tauri::command]
pub async fn update_device_info(
    db: State<'_, sqlx::SqlitePool>,
    device_info: DeviceInfo,
) -> Result<DeviceInfoResponse, String> {
    let sync_db = SyncDatabase::new(db.inner().clone());
    
    let metadata = DeviceMetadata {
        id: device_info.id,
        device_name: device_info.device_name,
        device_type: device_info.device_type,
        platform: device_info.platform,
        last_seen: chrono::Utc::now().to_rfc3339(),
        is_active: device_info.is_active,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    let saved_metadata = sync_db.update_device_metadata(metadata)
        .await
        .map_err(|e| format!("Failed to update device info: {}", e))?;
    
    Ok(DeviceInfoResponse {
        device: DeviceInfo {
            id: saved_metadata.id,
            device_name: saved_metadata.device_name,
            device_type: saved_metadata.device_type,
            platform: saved_metadata.platform,
            last_seen: saved_metadata.last_seen,
            is_active: saved_metadata.is_active,
        }
    })
}
