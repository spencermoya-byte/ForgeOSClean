use sqlx::{SqlitePool, Row};
use serde::{Deserialize, Serialize};

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
    pub configuration_schema: Option<serde_json::Value>, // New field for configuration schema
    pub default_configuration: Option<serde_json::Value>, // New field for default configuration
    pub is_compatible: bool, // New field to indicate compatibility
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
pub struct ExtensionInstallation {
    pub id: String,
    pub extension_id: String,
    pub version: String,
    pub status: InstallationStatus,
    pub installed_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstallationStatus {
    Installed,
    Updated,
    Failed,
    Uninstalled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionUpdate {
    pub id: String,
    pub extension_id: String,
    pub old_version: String,
    pub new_version: String,
    pub status: UpdateStatus,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateStatus {
    Updated,
    UpToDate,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetDownload {
    pub id: String,
    pub asset_id: String,
    pub version: String,
    pub status: DownloadStatus,
    pub downloaded_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DownloadStatus {
    Downloaded,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionConfiguration {
    pub extension_id: String,
    pub configuration: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

pub struct MarketplaceDatabase {
    pool: SqlitePool,
}

impl MarketplaceDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        MarketplaceDatabase { pool }
    }

    pub async fn create_extension(&self, extension: Extension) -> Result<Extension, sqlx::Error> {
        let query = r#"
            INSERT INTO extensions (id, name, version, description, author, author_id, category, tags, is_active, is_system, is_verified, rating, download_count, size, dependencies, capabilities, license, homepage, repository, created_at, updated_at, last_updated, metadata, permissions, compatibility, configuration_schema, default_configuration, is_compatible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&extension.id)
            .bind(&extension.name)
            .bind(&extension.version)
            .bind(&extension.description)
            .bind(&extension.author)
            .bind(&extension.author_id)
            .bind(&extension.category)
            .bind(&extension.tags.join(","))
            .bind(&extension.is_active)
            .bind(&extension.is_system)
            .bind(&extension.is_verified)
            .bind(&extension.rating)
            .bind(&extension.download_count)
            .bind(&extension.size)
            .bind(&extension.dependencies.join(","))
            .bind(&extension.capabilities.join(","))
            .bind(&extension.license)
            .bind(&extension.homepage)
            .bind(&extension.repository)
            .bind(&extension.created_at)
            .bind(&extension.updated_at)
            .bind(&extension.last_updated)
            .bind(&extension.metadata.to_string())
            .bind(&serde_json::to_string(&extension.permissions).unwrap_or_default())
            .bind(&serde_json::to_string(&extension.compatibility).unwrap_or_default())
            .bind(&extension.configuration_schema.as_ref().map(|v| v.to_string()).unwrap_or_default())
            .bind(&extension.default_configuration.as_ref().map(|v| v.to_string()).unwrap_or_default())
            .bind(&extension.is_compatible)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Extension {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            author_id: row.get("author_id"),
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            license: row.get("license"),
            homepage: row.get("homepage"),
            repository: row.get("repository"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
            permissions: serde_json::from_str(&row.get::<String, _>("permissions")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            configuration_schema: serde_json::from_str(&row.get::<String, _>("configuration_schema")).unwrap_or_default(),
            default_configuration: serde_json::from_str(&row.get::<String, _>("default_configuration")).unwrap_or_default(),
            is_compatible: row.get("is_compatible"),
        })
    }

    pub async fn get_extension(&self, id: &str) -> Result<Extension, sqlx::Error> {
        let query = r#"
            SELECT * FROM extensions WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Extension {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            author_id: row.get("author_id"),
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            license: row.get("license"),
            homepage: row.get("homepage"),
            repository: row.get("repository"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
            permissions: serde_json::from_str(&row.get::<String, _>("permissions")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            configuration_schema: serde_json::from_str(&row.get::<String, _>("configuration_schema")).unwrap_or_default(),
            default_configuration: serde_json::from_str(&row.get::<String, _>("default_configuration")).unwrap_or_default(),
            is_compatible: row.get("is_compatible"),
        })
    }

    pub async fn get_extensions(&self, limit: i32, offset: i32) -> Result<Vec<Extension>, sqlx::Error> {
        let query = r#"
            SELECT * FROM extensions ORDER BY created_at DESC LIMIT ? OFFSET ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;
            
        let mut extensions = Vec::new();
        for row in rows {
            extensions.push(Extension {
                id: row.get("id"),
                name: row.get("name"),
                version: row.get("version"),
                description: row.get("description"),
                author: row.get("author"),
                author_id: row.get("author_id"),
                category: row.get("category"),
                tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
                is_active: row.get("is_active"),
                is_system: row.get("is_system"),
                is_verified: row.get("is_verified"),
                rating: row.get("rating"),
                download_count: row.get("download_count"),
                size: row.get("size"),
                dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
                capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
                license: row.get("license"),
                homepage: row.get("homepage"),
                repository: row.get("repository"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                last_updated: row.get("last_updated"),
                metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
                permissions: serde_json::from_str(&row.get::<String, _>("permissions")).unwrap_or_default(),
                compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
                configuration_schema: serde_json::from_str(&row.get::<String, _>("configuration_schema")).unwrap_or_default(),
                default_configuration: serde_json::from_str(&row.get::<String, _>("default_configuration")).unwrap_or_default(),
                is_compatible: row.get("is_compatible"),
            });
        }
        
        Ok(extensions)
    }

    pub async fn update_extension(&self, id: &str, extension: Extension) -> Result<Extension, sqlx::Error> {
        let query = r#"
            UPDATE extensions 
            SET name = ?, version = ?, description = ?, author = ?, author_id = ?, category = ?, tags = ?, is_active = ?, is_system = ?, is_verified = ?, rating = ?, download_count = ?, size = ?, dependencies = ?, capabilities = ?, license = ?, homepage = ?, repository = ?, updated_at = ?, last_updated = ?, metadata = ?, permissions = ?, compatibility = ?, configuration_schema = ?, default_configuration = ?, is_compatible = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&extension.name)
            .bind(&extension.version)
            .bind(&extension.description)
            .bind(&extension.author)
            .bind(&extension.author_id)
            .bind(&extension.category)
            .bind(&extension.tags.join(","))
            .bind(&extension.is_active)
            .bind(&extension.is_system)
            .bind(&extension.is_verified)
            .bind(&extension.rating)
            .bind(&extension.download_count)
            .bind(&extension.size)
            .bind(&extension.dependencies.join(","))
            .bind(&extension.capabilities.join(","))
            .bind(&extension.license)
            .bind(&extension.homepage)
            .bind(&extension.repository)
            .bind(&extension.updated_at)
            .bind(&extension.last_updated)
            .bind(&extension.metadata.to_string())
            .bind(&serde_json::to_string(&extension.permissions).unwrap_or_default())
            .bind(&serde_json::to_string(&extension.compatibility).unwrap_or_default())
            .bind(&extension.configuration_schema.as_ref().map(|v| v.to_string()).unwrap_or_default())
            .bind(&extension.default_configuration.as_ref().map(|v| v.to_string()).unwrap_or_default())
            .bind(&extension.is_compatible)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Extension {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            author_id: row.get("author_id"),
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            license: row.get("license"),
            homepage: row.get("homepage"),
            repository: row.get("repository"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
            permissions: serde_json::from_str(&row.get::<String, _>("permissions")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            configuration_schema: serde_json::from_str(&row.get::<String, _>("configuration_schema")).unwrap_or_default(),
            default_configuration: serde_json::from_str(&row.get::<String, _>("default_configuration")).unwrap_or_default(),
            is_compatible: row.get("is_compatible"),
        })
    }

    pub async fn delete_extension(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM extensions WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_capability(&self, capability: Capability) -> Result<Capability, sqlx::Error> {
        let query = r#"
            INSERT INTO capabilities (id, name, description, category, version, provider, is_active, is_system, dependencies, capabilities, created_at, updated_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&capability.id)
            .bind(&capability.name)
            .bind(&capability.description)
            .bind(&capability.category)
            .bind(&capability.version)
            .bind(&capability.provider)
            .bind(&capability.is_active)
            .bind(&capability.is_system)
            .bind(&capability.dependencies.join(","))
            .bind(&capability.capabilities.join(","))
            .bind(&capability.created_at)
            .bind(&capability.updated_at)
            .bind(&capability.metadata.to_string())
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Capability {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            category: row.get("category"),
            version: row.get("version"),
            provider: row.get("provider"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn get_capability(&self, id: &str) -> Result<Capability, sqlx::Error> {
        let query = r#"
            SELECT * FROM capabilities WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Capability {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            category: row.get("category"),
            version: row.get("version"),
            provider: row.get("provider"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn get_capabilities(&self, limit: i32, offset: i32) -> Result<Vec<Capability>, sqlx::Error> {
        let query = r#"
            SELECT * FROM capabilities ORDER BY created_at DESC LIMIT ? OFFSET ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;
            
        let mut capabilities = Vec::new();
        for row in rows {
            capabilities.push(Capability {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                category: row.get("category"),
                version: row.get("version"),
                provider: row.get("provider"),
                is_active: row.get("is_active"),
                is_system: row.get("is_system"),
                dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
                capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
            });
        }
        
        Ok(capabilities)
    }

    pub async fn update_capability(&self, id: &str, capability: Capability) -> Result<Capability, sqlx::Error> {
        let query = r#"
            UPDATE capabilities 
            SET name = ?, description = ?, category = ?, version = ?, provider = ?, is_active = ?, is_system = ?, dependencies = ?, capabilities = ?, updated_at = ?, metadata = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&capability.name)
            .bind(&capability.description)
            .bind(&capability.category)
            .bind(&capability.version)
            .bind(&capability.provider)
            .bind(&capability.is_active)
            .bind(&capability.is_system)
            .bind(&capability.dependencies.join(","))
            .bind(&capability.capabilities.join(","))
            .bind(&capability.updated_at)
            .bind(&capability.metadata.to_string())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Capability {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            category: row.get("category"),
            version: row.get("version"),
            provider: row.get("provider"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            dependencies: row.get::<String, _>("dependencies").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn delete_capability(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM capabilities WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_engineering_asset(&self, asset: EngineeringAsset) -> Result<EngineeringAsset, sqlx::Error> {
        let query = r#"
            INSERT INTO engineering_assets (id, name, description, asset_type, category, tags, author, author_id, is_public, is_verified, rating, download_count, size, created_at, updated_at, last_updated, content, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&asset.id)
            .bind(&asset.name)
            .bind(&asset.description)
            .bind(&asset.asset_type.to_string())
            .bind(&asset.category)
            .bind(&asset.tags.join(","))
            .bind(&asset.author)
            .bind(&asset.author_id)
            .bind(&asset.is_public)
            .bind(&asset.is_verified)
            .bind(&asset.rating)
            .bind(&asset.download_count)
            .bind(&asset.size)
            .bind(&asset.created_at)
            .bind(&asset.updated_at)
            .bind(&asset.last_updated)
            .bind(&asset.content)
            .bind(&asset.metadata.to_string())
            .fetch_one(&self.pool)
            .await?;
            
        Ok(EngineeringAsset {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            asset_type: match row.get::<String, _>("asset_type").as_str() {
                "WorkflowTemplate" => AssetType::WorkflowTemplate,
                "AIModel" => AssetType::AIModel,
                "CodeTemplate" => AssetType::CodeTemplate,
                "Configuration" => AssetType::Configuration,
                "Dataset" => AssetType::Dataset,
                "Plugin" => AssetType::Plugin,
                "Tool" => AssetType::Tool,
                "Resource" => AssetType::Resource,
                _ => AssetType::Other,
            },
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            author: row.get("author"),
            author_id: row.get("author_id"),
            is_public: row.get("is_public"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            content: row.get("content"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn get_engineering_asset(&self, id: &str) -> Result<EngineeringAsset, sqlx::Error> {
        let query = r#"
            SELECT * FROM engineering_assets WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(EngineeringAsset {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            asset_type: match row.get::<String, _>("asset_type").as_str() {
                "WorkflowTemplate" => AssetType::WorkflowTemplate,
                "AIModel" => AssetType::AIModel,
                "CodeTemplate" => AssetType::CodeTemplate,
                "Configuration" => AssetType::Configuration,
                "Dataset" => AssetType::Dataset,
                "Plugin" => AssetType::Plugin,
                "Tool" => AssetType::Tool,
                "Resource" => AssetType::Resource,
                _ => AssetType::Other,
            },
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            author: row.get("author"),
            author_id: row.get("author_id"),
            is_public: row.get("is_public"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            content: row.get("content"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn get_engineering_assets(&self, limit: i32, offset: i32) -> Result<Vec<EngineeringAsset>, sqlx::Error> {
        let query = r#"
            SELECT * FROM engineering_assets ORDER BY created_at DESC LIMIT ? OFFSET ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;
            
        let mut assets = Vec::new();
        for row in rows {
            assets.push(EngineeringAsset {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                asset_type: match row.get::<String, _>("asset_type").as_str() {
                    "WorkflowTemplate" => AssetType::WorkflowTemplate,
                    "AIModel" => AssetType::AIModel,
                    "CodeTemplate" => AssetType::CodeTemplate,
                    "Configuration" => AssetType::Configuration,
                    "Dataset" => AssetType::Dataset,
                    "Plugin" => AssetType::Plugin,
                    "Tool" => AssetType::Tool,
                    "Resource" => AssetType::Resource,
                    _ => AssetType::Other,
                },
                category: row.get("category"),
                tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
                author: row.get("author"),
                author_id: row.get("author_id"),
                is_public: row.get("is_public"),
                is_verified: row.get("is_verified"),
                rating: row.get("rating"),
                download_count: row.get("download_count"),
                size: row.get("size"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                last_updated: row.get("last_updated"),
                content: row.get("content"),
                metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
            });
        }
        
        Ok(assets)
    }

    pub async fn update_engineering_asset(&self, id: &str, asset: EngineeringAsset) -> Result<EngineeringAsset, sqlx::Error> {
        let query = r#"
            UPDATE engineering_assets 
            SET name = ?, description = ?, asset_type = ?, category = ?, tags = ?, author = ?, author_id = ?, is_public = ?, is_verified = ?, rating = ?, download_count = ?, size = ?, updated_at = ?, last_updated = ?, content = ?, metadata = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&asset.name)
            .bind(&asset.description)
            .bind(&asset.asset_type.to_string())
            .bind(&asset.category)
            .bind(&asset.tags.join(","))
            .bind(&asset.author)
            .bind(&asset.author_id)
            .bind(&asset.is_public)
            .bind(&asset.is_verified)
            .bind(&asset.rating)
            .bind(&asset.download_count)
            .bind(&asset.size)
            .bind(&asset.updated_at)
            .bind(&asset.last_updated)
            .bind(&asset.content)
            .bind(&asset.metadata.to_string())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(EngineeringAsset {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            asset_type: match row.get::<String, _>("asset_type").as_str() {
                "WorkflowTemplate" => AssetType::WorkflowTemplate,
                "AIModel" => AssetType::AIModel,
                "CodeTemplate" => AssetType::CodeTemplate,
                "Configuration" => AssetType::Configuration,
                "Dataset" => AssetType::Dataset,
                "Plugin" => AssetType::Plugin,
                "Tool" => AssetType::Tool,
                "Resource" => AssetType::Resource,
                _ => AssetType::Other,
            },
            category: row.get("category"),
            tags: row.get::<String, _>("tags").split(",").map(|s| s.to_string()).collect(),
            author: row.get("author"),
            author_id: row.get("author_id"),
            is_public: row.get("is_public"),
            is_verified: row.get("is_verified"),
            rating: row.get("rating"),
            download_count: row.get("download_count"),
            size: row.get("size"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            last_updated: row.get("last_updated"),
            content: row.get("content"),
            metadata: serde_json::from_str(&row.get::<String, _>("metadata")).unwrap_or_default(),
        })
    }

    pub async fn delete_engineering_asset(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM engineering_assets WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_extension_installation(&self, installation: ExtensionInstallation) -> Result<ExtensionInstallation, sqlx::Error> {
        let query = r#"
            INSERT INTO extension_installations (id, extension_id, version, status, installed_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&installation.id)
            .bind(&installation.extension_id)
            .bind(&installation.version)
            .bind(&installation.status.to_string())
            .bind(&installation.installed_at)
            .bind(&installation.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionInstallation {
            id: row.get("id"),
            extension_id: row.get("extension_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Installed" => InstallationStatus::Installed,
                "Updated" => InstallationStatus::Updated,
                "Failed" => InstallationStatus::Failed,
                "Uninstalled" => InstallationStatus::Uninstalled,
                _ => InstallationStatus::Installed,
            },
            installed_at: row.get("installed_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_extension_installation(&self, id: &str) -> Result<ExtensionInstallation, sqlx::Error> {
        let query = r#"
            SELECT * FROM extension_installations WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionInstallation {
            id: row.get("id"),
            extension_id: row.get("extension_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Installed" => InstallationStatus::Installed,
                "Updated" => InstallationStatus::Updated,
                "Failed" => InstallationStatus::Failed,
                "Uninstalled" => InstallationStatus::Uninstalled,
                _ => InstallationStatus::Installed,
            },
            installed_at: row.get("installed_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_extension_installations(&self, extension_id: &str, limit: i32, offset: i32) -> Result<Vec<ExtensionInstallation>, sqlx::Error> {
        let query = r#"
            SELECT * FROM extension_installations WHERE extension_id = ? ORDER BY installed_at DESC LIMIT ? OFFSET ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(extension_id)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;
            
        let mut installations = Vec::new();
        for row in rows {
            installations.push(ExtensionInstallation {
                id: row.get("id"),
                extension_id: row.get("extension_id"),
                version: row.get("version"),
                status: match row.get::<String, _>("status").as_str() {
                    "Installed" => InstallationStatus::Installed,
                    "Updated" => InstallationStatus::Updated,
                    "Failed" => InstallationStatus::Failed,
                    "Uninstalled" => InstallationStatus::Uninstalled,
                    _ => InstallationStatus::Installed,
                },
                installed_at: row.get("installed_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(installations)
    }

    pub async fn update_extension_installation(&self, id: &str, installation: ExtensionInstallation) -> Result<ExtensionInstallation, sqlx::Error> {
        let query = r#"
            UPDATE extension_installations 
            SET extension_id = ?, version = ?, status = ?, installed_at = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&installation.extension_id)
            .bind(&installation.version)
            .bind(&installation.status.to_string())
            .bind(&installation.installed_at)
            .bind(&installation.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionInstallation {
            id: row.get("id"),
            extension_id: row.get("extension_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Installed" => InstallationStatus::Installed,
                "Updated" => InstallationStatus::Updated,
                "Failed" => InstallationStatus::Failed,
                "Uninstalled" => InstallationStatus::Uninstalled,
                _ => InstallationStatus::Installed,
            },
            installed_at: row.get("installed_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_asset_download(&self, download: AssetDownload) -> Result<AssetDownload, sqlx::Error> {
        let query = r#"
            INSERT INTO asset_downloads (id, asset_id, version, status, downloaded_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&download.id)
            .bind(&download.asset_id)
            .bind(&download.version)
            .bind(&download.status.to_string())
            .bind(&download.downloaded_at)
            .bind(&download.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AssetDownload {
            id: row.get("id"),
            asset_id: row.get("asset_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Downloaded" => DownloadStatus::Downloaded,
                "Failed" => DownloadStatus::Failed,
                "Cancelled" => DownloadStatus::Cancelled,
                _ => DownloadStatus::Downloaded,
            },
            downloaded_at: row.get("downloaded_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_asset_download(&self, id: &str) -> Result<AssetDownload, sqlx::Error> {
        let query = r#"
            SELECT * FROM asset_downloads WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AssetDownload {
            id: row.get("id"),
            asset_id: row.get("asset_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Downloaded" => DownloadStatus::Downloaded,
                "Failed" => DownloadStatus::Failed,
                "Cancelled" => DownloadStatus::Cancelled,
                _ => DownloadStatus::Downloaded,
            },
            downloaded_at: row.get("downloaded_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_asset_downloads(&self, asset_id: &str, limit: i32, offset: i32) -> Result<Vec<AssetDownload>, sqlx::Error> {
        let query = r#"
            SELECT * FROM asset_downloads WHERE asset_id = ? ORDER BY downloaded_at DESC LIMIT ? OFFSET ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(asset_id)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;
            
        let mut downloads = Vec::new();
        for row in rows {
            downloads.push(AssetDownload {
                id: row.get("id"),
                asset_id: row.get("asset_id"),
                version: row.get("version"),
                status: match row.get::<String, _>("status").as_str() {
                    "Downloaded" => DownloadStatus::Downloaded,
                    "Failed" => DownloadStatus::Failed,
                    "Cancelled" => DownloadStatus::Cancelled,
                    _ => DownloadStatus::Downloaded,
                },
                downloaded_at: row.get("downloaded_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(downloads)
    }

    pub async fn update_asset_download(&self, id: &str, download: AssetDownload) -> Result<AssetDownload, sqlx::Error> {
        let query = r#"
            UPDATE asset_downloads 
            SET asset_id = ?, version = ?, status = ?, downloaded_at = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&download.asset_id)
            .bind(&download.version)
            .bind(&download.status.to_string())
            .bind(&download.downloaded_at)
            .bind(&download.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AssetDownload {
            id: row.get("id"),
            asset_id: row.get("asset_id"),
            version: row.get("version"),
            status: match row.get::<String, _>("status").as_str() {
                "Downloaded" => DownloadStatus::Downloaded,
                "Failed" => DownloadStatus::Failed,
                "Cancelled" => DownloadStatus::Cancelled,
                _ => DownloadStatus::Downloaded,
            },
            downloaded_at: row.get("downloaded_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_extension_configuration(&self, config: ExtensionConfiguration) -> Result<ExtensionConfiguration, sqlx::Error> {
        let query = r#"
            INSERT INTO extension_configurations (extension_id, configuration, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.extension_id)
            .bind(&config.configuration.to_string())
            .bind(&config.created_at)
            .bind(&config.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionConfiguration {
            extension_id: row.get("extension_id"),
            configuration: serde_json::from_str(&row.get::<String, _>("configuration")).unwrap_or_default(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_extension_configuration(&self, extension_id: &str) -> Result<ExtensionConfiguration, sqlx::Error> {
        let query = r#"
            SELECT * FROM extension_configurations WHERE extension_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(extension_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionConfiguration {
            extension_id: row.get("extension_id"),
            configuration: serde_json::from_str(&row.get::<String, _>("configuration")).unwrap_or_default(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_extension_configuration(&self, extension_id: &str, config: ExtensionConfiguration) -> Result<ExtensionConfiguration, sqlx::Error> {
        let query = r#"
            UPDATE extension_configurations 
            SET configuration = ?, updated_at = ?
            WHERE extension_id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.configuration.to_string())
            .bind(&config.updated_at)
            .bind(extension_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExtensionConfiguration {
            extension_id: row.get("extension_id"),
            configuration: serde_json::from_str(&row.get::<String, _>("configuration")).unwrap_or_default(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_extension_configuration(&self, extension_id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM extension_configurations WHERE extension_id = ?
        "#;
        
        sqlx::query(query)
            .bind(extension_id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
}
