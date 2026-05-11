use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::plugin::PluginDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginCapability {
    pub id: String,
    pub plugin_id: String,
    pub capability: String,
    pub is_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginContext {
    pub plugin_id: String,
    pub capabilities: Vec<PluginCapability>,
    pub settings: Vec<PluginSetting>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginSetting {
    pub id: String,
    pub plugin_id: String,
    pub key: String,
    pub value: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginCapabilityRequest {
    pub plugin_id: String,
    pub capability: String,
    pub is_enabled: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginSettingRequest {
    pub plugin_id: String,
    pub key: String,
    pub value: String,
}

#[tauri::command]
pub async fn get_plugin_context(
    db: State<'_, sqlx::SqlitePool>,
    plugin_id: String,
) -> Result<PluginContext, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    
    // Get plugin capabilities
    let capabilities = plugin_db.get_plugin_capabilities(&plugin_id).await.map_err(|e| {
        format!("Failed to get plugin capabilities: {}", e)
    })?;
    
    // Get plugin settings
    let settings = plugin_db.get_plugin_settings(&plugin_id).await.map_err(|e| {
        format!("Failed to get plugin settings: {}", e)
    })?;
    
    Ok(PluginContext {
        plugin_id,
        capabilities,
        settings,
    })
}

#[tauri::command]
pub async fn update_plugin_capability(
    db: State<'_, sqlx::SqlitePool>,
    request: PluginCapabilityRequest,
) -> Result<PluginCapability, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    
    let capability = PluginCapability {
        id: uuid::Uuid::new_v4().to_string(),
        plugin_id: request.plugin_id,
        capability: request.capability,
        is_enabled: request.is_enabled,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match plugin_db.create_plugin_capability(capability).await {
        Ok(capability) => Ok(capability),
        Err(e) => Err(format!("Failed to create plugin capability: {}", e)),
    }
}

#[tauri::command]
pub async fn update_plugin_setting(
    db: State<'_, sqlx::SqlitePool>,
    request: PluginSettingRequest,
) -> Result<PluginSetting, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    
    // First check if setting exists
    let existing_setting = plugin_db.get_plugin_setting(&request.plugin_id, &request.key).await.map_err(|e| {
        format!("Failed to check plugin setting: {}", e)
    })?;
    
    if let Some(setting) = existing_setting {
        // Update existing setting
        match plugin_db.update_plugin_setting(&setting.id, &request.value).await {
            Ok(setting) => Ok(setting),
            Err(e) => Err(format!("Failed to update plugin setting: {}", e)),
        }
    } else {
        // Create new setting
        let setting = PluginSetting {
            id: uuid::Uuid::new_v4().to_string(),
            plugin_id: request.plugin_id,
            key: request.key,
            value: request.value,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        };
        
        match plugin_db.create_plugin_setting(setting).await {
            Ok(setting) => Ok(setting),
            Err(e) => Err(format!("Failed to create plugin setting: {}", e)),
        }
    }
}
