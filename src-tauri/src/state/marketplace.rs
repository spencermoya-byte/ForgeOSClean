use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceState {
    pub extensions: HashMap<String, Extension>,
    pub capabilities: HashMap<String, Capability>,
    pub assets: HashMap<String, EngineeringAsset>,
    pub installed_extensions: Vec<String>,
    pub active_extensions: Vec<String>,
    pub marketplace_config: MarketplaceConfig,
    pub ecosystem_health: EcosystemHealth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub author_id: String,
    pub category: String,
    pub tags: Vec<String>,
    pub is_active: bool,
    pub is_system: bool,
    pub is_verified: bool,
    pub rating: f32,
    pub download_count: u64,
    pub size: u64,
    pub dependencies: Vec<String>,
    pub capabilities: Vec<String>,
    pub license: String,
    pub homepage: String,
    pub repository: String,
    pub created_at: String,
    pub updated_at: String,
    pub last_updated: String,
    pub metadata: serde_json::Value,
    pub permissions: Vec<ExtensionPermission>, // New field for permissions
    pub compatibility: ExtensionCompatibility, // New field for compatibility
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionPermission {
    pub name: String,
    pub description: String,
    pub type_: PermissionType, // Using type_ to avoid conflict with Rust keyword
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PermissionType {
    Filesystem,
    Network,
    AIModel,
    Workspace,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionCompatibility {
    pub os: Vec<String>,
    pub architecture: Vec<String>,
    pub forgeos_version: String,
    pub status: CompatibilityStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompatibilityStatus {
    Compatible,
    Incompatible,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capability {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub version: String,
    pub provider: String,
    pub is_active: bool,
    pub is_system: bool,
    pub dependencies: Vec<String>,
    pub capabilities: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineeringAsset {
    pub id: String,
    pub name: String,
    pub description: String,
    pub asset_type: AssetType,
    pub category: String,
    pub tags: Vec<String>,
    pub author: String,
    pub author_id: String,
    pub is_public: bool,
    pub is_verified: bool,
    pub rating: f32,
    pub download_count: u64,
    pub size: u64,
    pub created_at: String,
    pub updated_at: String,
    pub last_updated: String,
    pub content: String, // JSON or serialized content
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceConfig {
    pub is_enabled: bool,
    pub auto_update: bool,
    pub update_check_interval: u32, // in hours
    pub max_download_threads: u32,
    pub cache_enabled: bool,
    pub cache_size_limit: u64, // in MB
    pub trusted_sources: Vec<String>,
    pub security_level: SecurityLevel,
    pub default_category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecurityLevel {
    Low,
    Medium,
    High,
    Strict,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EcosystemHealth {
    pub total_extensions: u64,
    pub active_extensions: u64,
    pub total_assets: u64,
    pub verified_extensions: u64,
    pub security_score: f32,
    pub performance_score: f32,
    pub last_updated: String,
    pub health_status: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
    Unknown,
}

impl Default for MarketplaceState {
    fn default() -> Self {
        MarketplaceState {
            extensions: HashMap::new(),
            capabilities: HashMap::new(),
            assets: HashMap::new(),
            installed_extensions: vec![],
            active_extensions: vec![],
            marketplace_config: MarketplaceConfig {
                is_enabled: true,
                auto_update: true,
                update_check_interval: 24,
                max_download_threads: 5,
                cache_enabled: true,
                cache_size_limit: 1024, // 1GB
                trusted_sources: vec!["forgeos".to_string()],
                security_level: SecurityLevel::Medium,
                default_category: "general".to_string(),
            },
            ecosystem_health: EcosystemHealth {
                total_extensions: 0,
                active_extensions: 0,
                total_assets: 0,
                verified_extensions: 0,
                security_score: 1.0,
                performance_score: 1.0,
                last_updated: chrono::Utc::now().to_rfc3339(),
                health_status: HealthStatus::Healthy,
            },
        }
    }
}
