use serde::{Deserialize, Serialize};
use tauri::State;
use crate::state::marketplace::{MarketplaceState, Extension, Capability, EngineeringAsset, ExtensionPermission, PermissionType, ExtensionCompatibility, CompatibilityStatus, DependencyInfo, Dependency, DependencyStatus};

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionSearchRequest {
    pub query: String,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub limit: u32,
    pub offset: u32,
    pub sort_by: String,
    pub sort_order: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionSearchResponse {
    pub extensions: Vec<Extension>,
    pub total: u64,
    pub page: u32,
    pub page_size: u32,
    pub has_more: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionInstallationRequest {
    pub extension_id: String,
    pub version: Option<String>,
    pub force: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionInstallationResponse {
    pub extension_id: String,
    pub status: InstallationStatus,
    pub message: String,
    pub installed_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum InstallationStatus {
    Installed,
    Updated,
    Failed,
    Cancelled,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionUpdateRequest {
    pub extension_id: String,
    pub version: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionUpdateResponse {
    pub extension_id: String,
    pub old_version: String,
    pub new_version: String,
    pub status: UpdateStatus,
    pub message: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum UpdateStatus {
    Updated,
    UpToDate,
    Failed,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CapabilityRegistrationRequest {
    pub capability: Capability,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CapabilityRegistrationResponse {
    pub capability_id: String,
    pub status: RegistrationStatus,
    pub message: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum RegistrationStatus {
    Registered,
    AlreadyExists,
    Failed,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AssetSearchRequest {
    pub query: String,
    pub asset_type: Option<AssetType>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub author: Option<String>,
    pub limit: u32,
    pub offset: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AssetSearchResponse {
    pub assets: Vec<EngineeringAsset>,
    pub total: u64,
    pub page: u32,
    pub page_size: u32,
    pub has_more: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AssetDownloadRequest {
    pub asset_id: String,
    pub version: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AssetDownloadResponse {
    pub asset_id: String,
    pub status: DownloadStatus,
    pub message: String,
    pub downloaded_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum DownloadStatus {
    Downloaded,
    AlreadyExists,
    Failed,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum AssetType {
    WorkflowTemplate,
    AIModel,
    CodeTemplate,
    Configuration,
    Dataset,
    Plugin,
    Tool,
    Resource,
    Other,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionConfigurationRequest {
    pub extension_id: String,
    pub configuration: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtensionConfigurationResponse {
    pub extension_id: String,
    pub status: ConfigurationStatus,
    pub message: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum ConfigurationStatus {
    Saved,
    Failed,
    Invalid,
}

#[tauri::command]
pub async fn search_extensions(
    _db: State<'_, sqlx::SqlitePool>,
    request: ExtensionSearchRequest,
) -> Result<ExtensionSearchResponse, String> {
    // In a real implementation, this would query the database or marketplace API
    Ok(ExtensionSearchResponse {
        extensions: vec![],
        total: 0,
        page: request.offset / request.limit,
        page_size: request.limit,
        has_more: false,
    })
}

#[tauri::command]
pub async fn install_extension(
    _db: State<'_, sqlx::SqlitePool>,
    request: ExtensionInstallationRequest,
) -> Result<ExtensionInstallationResponse, String> {
    // In a real implementation, this would handle extension installation
    Ok(ExtensionInstallationResponse {
        extension_id: request.extension_id,
        status: InstallationStatus::Installed,
        message: "Extension installed successfully".to_string(),
        installed_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn update_extension(
    _db: State<'_, sqlx::SqlitePool>,
    request: ExtensionUpdateRequest,
) -> Result<ExtensionUpdateResponse, String> {
    // In a real implementation, this would handle extension updates
    Ok(ExtensionUpdateResponse {
        extension_id: request.extension_id,
        old_version: "1.0.0".to_string(),
        new_version: "1.1.0".to_string(),
        status: UpdateStatus::Updated,
        message: "Extension updated successfully".to_string(),
    })
}

#[tauri::command]
pub async fn register_capability(
    _db: State<'_, sqlx::SqlitePool>,
    request: CapabilityRegistrationRequest,
) -> Result<CapabilityRegistrationResponse, String> {
    // In a real implementation, this would register a new capability
    Ok(CapabilityRegistrationResponse {
        capability_id: request.capability.id,
        status: RegistrationStatus::Registered,
        message: "Capability registered successfully".to_string(),
    })
}

#[tauri::command]
pub async fn search_assets(
    _db: State<'_, sqlx::SqlitePool>,
    request: AssetSearchRequest,
) -> Result<AssetSearchResponse, String> {
    // In a real implementation, this would query the database or asset repository
    Ok(AssetSearchResponse {
        assets: vec![],
        total: 0,
        page: request.offset / request.limit,
        page_size: request.limit,
        has_more: false,
    })
}

#[tauri::command]
pub async fn download_asset(
    _db: State<'_, sqlx::SqlitePool>,
    request: AssetDownloadRequest,
) -> Result<AssetDownloadResponse, String> {
    // In a real implementation, this would handle asset downloads
    Ok(AssetDownloadResponse {
        asset_id: request.asset_id,
        status: DownloadStatus::Downloaded,
        message: "Asset downloaded successfully".to_string(),
        downloaded_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn get_marketplace_status(
    _db: State<'_, sqlx::SqlitePool>,
) -> Result<MarketplaceState, String> {
    // In a real implementation, this would return current marketplace state
    Ok(MarketplaceState::default())
}

#[tauri::command]
pub async fn get_extension_configuration(
    db: State<'_, sqlx::SqlitePool>,
    extension_id: String,
) -> Result<serde_json::Value, String> {
    // In a real implementation, this would fetch the extension configuration
    match db.get_extension_configuration(&extension_id).await {
        Ok(config) => Ok(config.configuration),
        Err(_) => Ok(serde_json::json!({})),
    }
}

#[tauri::command]
pub async fn save_extension_configuration(
    db: State<'_, sqlx::SqlitePool>,
    request: ExtensionConfigurationRequest,
) -> Result<ExtensionConfigurationResponse, String> {
    // In a real implementation, this would save the extension configuration
    let now = chrono::Utc::now().to_rfc3339();
    
    let config = crate::database::marketplace::ExtensionConfiguration {
        extension_id: request.extension_id.clone(),
        configuration: request.configuration,
        created_at: now.clone(),
        updated_at: now,
    };
    
    match db.update_extension_configuration(&request.extension_id, config).await {
        Ok(_) => Ok(ExtensionConfigurationResponse {
            extension_id: request.extension_id,
            status: ConfigurationStatus::Saved,
            message: "Configuration saved successfully".to_string(),
        }),
        Err(_) => Ok(ExtensionConfigurationResponse {
            extension_id: request.extension_id,
            status: ConfigurationStatus::Failed,
            message: "Failed to save configuration".to_string(),
        }),
    }
}

// New command for getting extension safety review data
#[tauri::command]
pub async fn get_extension_safety_review(
    db: State<'_, sqlx::SqlitePool>,
    extension_id: String,
) -> Result<serde_json::Value, String> {
    // In a real implementation, this would fetch the extension safety review data
    match db.get_extension(&extension_id).await {
        Ok(extension) => {
            let safety_review = serde_json::json!({
                "extension_id": extension.id,
                "name": extension.name,
                "version": extension.version,
                "author": extension.author,
                "permissions": extension.permissions,
                "compatibility": extension.compatibility,
                "is_compatible": extension.is_compatible,
                "has_configuration": extension.configuration_schema.is_some(),
                "has_permissions": !extension.permissions.is_empty(),
                "is_verified": extension.is_verified,
                "description": extension.description,
                "size": extension.size,
                "rating": extension.rating,
                "download_count": extension.download_count,
                "dependency_info": extension.dependency_info,
            });
            Ok(safety_review)
        }
        Err(_) => Ok(serde_json::json!({
            "error": "Extension not found"
        })),
    }
}
