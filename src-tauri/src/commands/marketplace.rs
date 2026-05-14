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
    db: State<'_, sqlx::SqlitePool>,
    request: ExtensionSearchRequest,
) -> Result<ExtensionSearchResponse, String> {
    // In a real implementation, this would query the database or marketplace API
    let extensions = db.get_extensions(request.limit as i32, request.offset as i32).await
        .map_err(|e| e.to_string())?;
    
    Ok(ExtensionSearchResponse {
        extensions,
        total: extensions.len() as u64,
        page: request.offset / request.limit,
        page_size: request.limit,
        has_more: false,
    })
}

#[tauri::command]
pub async fn install_extension(
    db: State<'_, sqlx::SqlitePool>,
    request: ExtensionInstallationRequest,
) -> Result<ExtensionInstallationResponse, String> {
    // In a real implementation, this would handle extension installation
    // For now, we'll simulate a successful installation
    let extension = db.get_extension(&request.extension_id).await
        .map_err(|e| e.to_string())?;
    
    // Create installation record
    let now = chrono::Utc::now().to_rfc3339();
    let installation = crate::database::marketplace::ExtensionInstallation {
        id: uuid::Uuid::new_v4().to_string(),
        extension_id: request.extension_id.clone(),
        version: extension.version.clone(),
        status: crate::database::marketplace::InstallationStatus::Installed,
        installed_at: now.clone(),
        updated_at: now,
    };
    
    db.create_extension_installation(installation).await
        .map_err(|e| e.to_string())?;
    
    // Update marketplace state to reflect installation
    let mut updated_extension = extension;
    updated_extension.is_active = true;
    
    db.update_extension(&request.extension_id, updated_extension).await
        .map_err(|e| e.to_string())?;
    
    Ok(ExtensionInstallationResponse {
        extension_id: request.extension_id,
        status: InstallationStatus::Installed,
        message: "Extension installed successfully".to_string(),
        installed_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn update_extension(
    db: State<'_, sqlx::SqlitePool>,
    request: ExtensionUpdateRequest,
) -> Result<ExtensionUpdateResponse, String> {
    // In a real implementation, this would handle extension updates
    // For now, we'll simulate a successful update
    let extension = db.get_extension(&request.extension_id).await
        .map_err(|e| e.to_string())?;
    
    // Create update record
    let now = chrono::Utc::now().to_rfc3339();
    let update = crate::database::marketplace::ExtensionUpdate {
        id: uuid::Uuid::new_v4().to_string(),
        extension_id: request.extension_id.clone(),
        old_version: extension.version.clone(),
        new_version: "1.1.0".to_string(), // Simulated new version
        status: crate::database::marketplace::UpdateStatus::Updated,
        updated_at: now,
    };
    
    db.create_extension_update(update).await
        .map_err(|e| e.to_string())?;
    
    // Update marketplace state to reflect update
    let mut updated_extension = extension;
    updated_extension.version = "1.1.0".to_string();
    updated_extension.updated_at = now.clone();
    updated_extension.last_updated = now;
    
    db.update_extension(&request.extension_id, updated_extension).await
        .map_err(|e| e.to_string())?;
    
    Ok(ExtensionUpdateResponse {
        extension_id: request.extension_id,
        old_version: extension.version,
        new_version: "1.1.0".to_string(),
        status: UpdateStatus::Updated,
        message: "Extension updated successfully".to_string(),
    })
}

#[tauri::command]
pub async fn register_capability(
    db: State<'_, sqlx::SqlitePool>,
    request: CapabilityRegistrationRequest,
) -> Result<CapabilityRegistrationResponse, String> {
    // In a real implementation, this would register a new capability
    let capability = db.create_capability(request.capability).await
        .map_err(|e| e.to_string())?;
    
    Ok(CapabilityRegistrationResponse {
        capability_id: capability.id,
        status: RegistrationStatus::Registered,
        message: "Capability registered successfully".to_string(),
    })
}

#[tauri::command]
pub async fn search_assets(
    db: State<'_, sqlx::SqlitePool>,
    request: AssetSearchRequest,
) -> Result<AssetSearchResponse, String> {
    // In a real implementation, this would query the database or asset repository
    let assets = db.get_engineering_assets(request.limit as i32, request.offset as i32).await
        .map_err(|e| e.to_string())?;
    
    Ok(AssetSearchResponse {
        assets,
        total: assets.len() as u64,
        page: request.offset / request.limit,
        page_size: request.limit,
        has_more: false,
    })
}

#[tauri::command]
pub async fn download_asset(
    db: State<'_, sqlx::SqlitePool>,
    request: AssetDownloadRequest,
) -> Result<AssetDownloadResponse, String> {
    // In a real implementation, this would handle asset downloads
    // For now, we'll simulate a successful download
    let now = chrono::Utc::now().to_rfc3339();
    
    // Create download record
    let download = crate::database::marketplace::AssetDownload {
        id: uuid::Uuid::new_v4().to_string(),
        asset_id: request.asset_id.clone(),
        version: request.version.unwrap_or_else(|| "1.0.0".to_string()),
        status: crate::database::marketplace::DownloadStatus::Downloaded,
        downloaded_at: now.clone(),
        updated_at: now,
    };
    
    db.create_asset_download(download).await
        .map_err(|e| e.to_string())?;
    
    Ok(AssetDownloadResponse {
        asset_id: request.asset_id,
        status: DownloadStatus::Downloaded,
        message: "Asset downloaded successfully".to_string(),
        downloaded_at: now,
    })
}

#[tauri::command]
pub async fn get_marketplace_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<MarketplaceState, String> {
    // In a real implementation, this would return current marketplace state
    let mut state = MarketplaceState::default();
    
    // Populate extensions from database
    let extensions = db.get_extensions(100, 0).await
        .map_err(|e| e.to_string())?;
    
    for extension in extensions {
        state.extensions.insert(extension.id.clone(), extension);
    }
    
    Ok(state)
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

// New command for uninstalling an extension
#[tauri::command]
pub async fn uninstall_extension(
    db: State<'_, sqlx::SqlitePool>,
    extension_id: String,
) -> Result<ExtensionInstallationResponse, String> {
    // In a real implementation, this would handle extension uninstallation
    // For now, we'll simulate a successful uninstallation
    let extension = db.get_extension(&extension_id).await
        .map_err(|e| e.to_string())?;
    
    // Create uninstallation record
    let now = chrono::Utc::now().to_rfc3339();
    let installation = crate::database::marketplace::ExtensionInstallation {
        id: uuid::Uuid::new_v4().to_string(),
        extension_id: extension_id.clone(),
        version: extension.version.clone(),
        status: crate::database::marketplace::InstallationStatus::Uninstalled,
        installed_at: now.clone(),
        updated_at: now,
    };
    
    db.create_extension_installation(installation).await
        .map_err(|e| e.to_string())?;
    
    // Update marketplace state to reflect uninstallation
    let mut updated_extension = extension;
    updated_extension.is_active = false;
    
    db.update_extension(&extension_id, updated_extension).await
        .map_err(|e| e.to_string())?;
    
    Ok(ExtensionInstallationResponse {
        extension_id,
        status: InstallationStatus::Uninstalled,
        message: "Extension uninstalled successfully".to_string(),
        installed_at: now,
    })
}
