use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::plugin::PluginDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct Plugin {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub is_active: bool,
    pub is_system: bool,
    pub capabilities: String,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
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
pub struct PluginCapability {
    pub id: String,
    pub plugin_id: String,
    pub capability: String,
    pub is_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreatePluginRequest {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub is_active: bool,
    pub is_system: bool,
    pub capabilities: String,
    pub config: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdatePluginRequest {
    pub name: Option<String>,
    pub version: Option<String>,
    pub description: Option<String>,
    pub author: Option<String>,
    pub is_active: Option<bool>,
    pub is_system: Option<bool>,
    pub capabilities: Option<String>,
    pub config: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct PluginResponse {
    pub plugin: Plugin,
}

#[derive(Serialize, Deserialize)]
pub struct PluginsResponse {
    pub plugins: Vec<Plugin>,
}

#[derive(Serialize, Deserialize)]
pub struct PluginSettingResponse {
    pub setting: PluginSetting,
}

#[derive(Serialize, Deserialize)]
pub struct PluginSettingsResponse {
    pub settings: Vec<PluginSetting>,
}

#[derive(Serialize, Deserialize)]
pub struct PluginCapabilityResponse {
    pub capability: PluginCapability,
}

#[derive(Serialize, Deserialize)]
pub struct PluginCapabilitiesResponse {
    pub capabilities: Vec<PluginCapability>,
}

#[tauri::command]
pub async fn get_plugins(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<PluginsResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.get_plugins().await {
        Ok(plugins) => Ok(PluginsResponse { plugins }),
        Err(e) => Err(format!("Failed to get plugins: {}", e)),
    }
}

#[tauri::command]
pub async fn get_plugin(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<PluginResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.get_plugin(&id).await {
        Ok(plugin) => Ok(PluginResponse { plugin }),
        Err(e) => Err(format!("Failed to get plugin: {}", e)),
    }
}

#[tauri::command]
pub async fn create_plugin(
    db: State<'_, sqlx::SqlitePool>,
    request: CreatePluginRequest,
) -> Result<PluginResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    
    let plugin = Plugin {
        id: uuid::Uuid::new_v4().to_string(),
        name: request.name,
        version: request.version,
        description: request.description,
        author: request.author,
        is_active: request.is_active,
        is_system: request.is_system,
        capabilities: request.capabilities,
        config: request.config,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match plugin_db.create_plugin(plugin).await {
        Ok(plugin) => Ok(PluginResponse { plugin }),
        Err(e) => Err(format!("Failed to create plugin: {}", e)),
    }
}

#[tauri::command]
pub async fn update_plugin(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdatePluginRequest,
) -> Result<PluginResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    
    // First get the existing plugin
    let existing_plugin = plugin_db.get_plugin(&id).await.map_err(|e| format!("Failed to get plugin: {}", e))?;
    
    let plugin = Plugin {
        id: existing_plugin.id,
        name: request.name.unwrap_or(existing_plugin.name),
        version: request.version.unwrap_or(existing_plugin.version),
        description: request.description.unwrap_or(existing_plugin.description),
        author: request.author.unwrap_or(existing_plugin.author),
        is_active: request.is_active.unwrap_or(existing_plugin.is_active),
        is_system: request.is_system.unwrap_or(existing_plugin.is_system),
        capabilities: request.capabilities.unwrap_or(existing_plugin.capabilities),
        config: request.config.unwrap_or(existing_plugin.config),
        created_at: existing_plugin.created_at,
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match plugin_db.update_plugin(&id, plugin).await {
        Ok(plugin) => Ok(PluginResponse { plugin }),
        Err(e) => Err(format!("Failed to update plugin: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_plugin(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.delete_plugin(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete plugin: {}", e)),
    }
}

#[tauri::command]
pub async fn get_plugin_settings(
    db: State<'_, sqlx::SqlitePool>,
    plugin_id: String,
) -> Result<PluginSettingsResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.get_plugin_settings(&plugin_id).await {
        Ok(settings) => Ok(PluginSettingsResponse { settings }),
        Err(e) => Err(format!("Failed to get plugin settings: {}", e)),
    }
}

#[tauri::command]
pub async fn get_plugin_setting(
    db: State<'_, sqlx::SqlitePool>,
    plugin_id: String,
    key: String,
) -> Result<PluginSettingResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.get_plugin_setting(&plugin_id, &key).await {
        Ok(Some(setting)) => Ok(PluginSettingResponse { setting }),
        Ok(None) => Err("Plugin setting not found".to_string()),
        Err(e) => Err(format!("Failed to get plugin setting: {}", e)),
    }
}

#[tauri::command]
pub async fn update_plugin_setting(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    value: String,
) -> Result<PluginSettingResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.update_plugin_setting(&id, &value).await {
        Ok(setting) => Ok(PluginSettingResponse { setting }),
        Err(e) => Err(format!("Failed to update plugin setting: {}", e)),
    }
}

#[tauri::command]
pub async fn get_plugin_capabilities(
    db: State<'_, sqlx::SqlitePool>,
    plugin_id: String,
) -> Result<PluginCapabilitiesResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.get_plugin_capabilities(&plugin_id).await {
        Ok(capabilities) => Ok(PluginCapabilitiesResponse { capabilities }),
        Err(e) => Err(format!("Failed to get plugin capabilities: {}", e)),
    }
}

#[tauri::command]
pub async fn update_plugin_capability(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    is_enabled: bool,
) -> Result<PluginCapabilityResponse, String> {
    let plugin_db = PluginDatabase::new(db.inner().clone());
    match plugin_db.update_plugin_capability(&id, is_enabled).await {
        Ok(capability) => Ok(PluginCapabilityResponse { capability }),
        Err(e) => Err(format!("Failed to update plugin capability: {}", e)),
    }
}
