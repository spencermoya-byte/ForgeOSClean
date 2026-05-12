use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::collections::HashMap;

// Extension models
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
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
    pub created_at: String,
    pub updated_at: String,
    pub installed_at: Option<String>,
    pub updated_at_version: Option<String>,
    pub dependencies: Vec<String>,
    pub compatibility: ExtensionCompatibility,
    pub metadata: serde_json::Value,
    pub download_url: Option<String>,
    pub size: Option<u64>,
    pub rating: Option<f32>,
    pub review_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExtensionCompatibility {
    pub platform: String,
    pub min_version: String,
    pub max_version: Option<String>,
    pub supported_features: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
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
    pub created_at: String,
    pub updated_at: String,
    pub metadata: serde_json::Value,
    pub is_public: bool,
    pub visibility: String, // public, private, restricted
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExtensionInstallation {
    pub id: String,
    pub extension_id: String,
    pub workspace_id: String,
    pub installation_status: InstallationStatus,
    pub update_status: UpdateStatus,
    pub installed_at: String,
    pub updated_at: String,
    pub version: String,
    pub metadata: serde_json::Value,
    pub install_path: Option<String>,
    pub is_system: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExtensionUpdate {
    pub id: String,
    pub extension_id: String,
    pub version: String,
    pub status: UpdateStatus,
    pub updated_at: String,
    pub metadata: serde_json::Value,
    pub update_notes: Option<String>,
    pub release_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstallationStatus {
    Installed,
    Updated,
    Failed,
    Cancelled,
    Uninstalled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateStatus {
    Updated,
    UpToDate,
    Failed,
    Pending,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionSearchRequest {
    pub query: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub author: Option<String>,
    pub is_active: Option<bool>,
    pub is_system: Option<bool>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInstallationRequest {
    pub extension_id: String,
    pub workspace_id: String,
    pub version: Option<String>,
    pub is_system: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionUpdateRequest {
    pub extension_id: String,
    pub workspace_id: String,
    pub version: Option<String>,
    pub force_update: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityRegistrationRequest {
    pub capability: Capability,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionSearchResponse {
    pub extensions: Vec<Extension>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
    pub has_more: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInstallationResponse {
    pub installation_id: String,
    pub status: InstallationStatus,
    pub install_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionUpdateResponse {
    pub update_id: String,
    pub status: UpdateStatus,
    pub updated_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionLifecycleEvent {
    pub extension_id: String,
    pub event_type: ExtensionLifecycleEventType,
    pub timestamp: String,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExtensionLifecycleEventType {
    Installed,
    Updated,
    Uninstalled,
    Enabled,
    Disabled,
    Failed,
}

// Marketplace database structure
pub struct MarketplaceDatabase {
    pool: SqlitePool,
}

impl MarketplaceDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        MarketplaceDatabase { pool }
    }

    pub async fn create_extension(&self, extension: Extension) -> Result<Extension, sqlx::Error> {
        let query = r#"
            INSERT INTO extensions (id, name, version, description, author, author_id, category, tags, is_active, is_system, created_at, updated_at, installed_at, updated_at_version, dependencies, compatibility, metadata, download_url, size, rating, review_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            .bind(serde_json::to_string(&extension.tags).unwrap_or_default())
            .bind(extension.is_active)
            .bind(extension.is_system)
            .bind(&extension.created_at)
            .bind(&extension.updated_at)
            .bind(&extension.installed_at)
            .bind(&extension.updated_at_version)
            .bind(serde_json::to_string(&extension.dependencies).unwrap_or_default())
            .bind(serde_json::to_string(&extension.compatibility).unwrap_or_default())
            .bind(&extension.metadata)
            .bind(&extension.download_url)
            .bind(&extension.size)
            .bind(&extension.rating)
            .bind(&extension.review_count)
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
            tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            installed_at: row.get("installed_at"),
            updated_at_version: row.get("updated_at_version"),
            dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            metadata: row.get("metadata"),
            download_url: row.get("download_url"),
            size: row.get("size"),
            rating: row.get("rating"),
            review_count: row.get("review_count"),
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
            tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            installed_at: row.get("installed_at"),
            updated_at_version: row.get("updated_at_version"),
            dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            metadata: row.get("metadata"),
            download_url: row.get("download_url"),
            size: row.get("size"),
            rating: row.get("rating"),
            review_count: row.get("review_count"),
        })
    }

    pub async fn update_extension(&self, id: &str, extension: Extension) -> Result<Extension, sqlx::Error> {
        let query = r#"
            UPDATE extensions 
            SET name = ?, version = ?, description = ?, author = ?, author_id = ?, category = ?, tags = ?, is_active = ?, is_system = ?, updated_at = ?, installed_at = ?, updated_at_version = ?, dependencies = ?, compatibility = ?, metadata = ?, download_url = ?, size = ?, rating = ?, review_count = ?
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
            .bind(serde_json::to_string(&extension.tags).unwrap_or_default())
            .bind(extension.is_active)
            .bind(extension.is_system)
            .bind(&extension.updated_at)
            .bind(&extension.installed_at)
            .bind(&extension.updated_at_version)
            .bind(serde_json::to_string(&extension.dependencies).unwrap_or_default())
            .bind(serde_json::to_string(&extension.compatibility).unwrap_or_default())
            .bind(&extension.metadata)
            .bind(&extension.download_url)
            .bind(&extension.size)
            .bind(&extension.rating)
            .bind(&extension.review_count)
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
            tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            installed_at: row.get("installed_at"),
            updated_at_version: row.get("updated_at_version"),
            dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
            compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
            metadata: row.get("metadata"),
            download_url: row.get("download_url"),
            size: row.get("size"),
            rating: row.get("rating"),
            review_count: row.get("review_count"),
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

    pub async fn search_extensions(&self, request: ExtensionSearchRequest) -> Result<ExtensionSearchResponse, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM extensions WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(query_str) = &request.query {
            query.push_str(" AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)");
            binds.push(&format!("%{}%", query_str));
            binds.push(&format!("%{}%", query_str));
            binds.push(&format!("%{}%", query_str));
        }
        
        if let Some(category) = &request.category {
            query.push_str(" AND category = ?");
            binds.push(category);
        }
        
        if let Some(tags) = &request.tags {
            query.push_str(" AND tags LIKE ?");
            binds.push(&format!("%{}%", tags.join("%")));
        }
        
        if let Some(author) = &request.author {
            query.push_str(" AND author = ?");
            binds.push(author);
        }
        
        if let Some(is_active) = request.is_active {
            query.push_str(" AND is_active = ?");
            binds.push(&is_active);
        }
        
        if let Some(is_system) = request.is_system {
            query.push_str(" AND is_system = ?");
            binds.push(&is_system);
        }
        
        // Add sorting
        let sort_by = request.sort_by.unwrap_or_else(|| "created_at".to_string());
        let sort_order = request.sort_order.unwrap_or_else(|| "desc".to_string());
        
        query.push_str(&format!(" ORDER BY {} {}", sort_by, sort_order));
        
        // Add pagination
        let limit = request.limit.unwrap_or(20);
        let offset = request.offset.unwrap_or(0);
        
        query.push_str(&format!(" LIMIT {} OFFSET {}", limit, offset));
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let extensions = rows
            .into_iter()
            .map(|row| Extension {
                id: row.get("id"),
                name: row.get("name"),
                version: row.get("version"),
                description: row.get("description"),
                author: row.get("author"),
                author_id: row.get("author_id"),
                category: row.get("category"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                is_active: row.get("is_active"),
                is_system: row.get("is_system"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                installed_at: row.get("installed_at"),
                updated_at_version: row.get("updated_at_version"),
                dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
                compatibility: serde_json::from_str(&row.get::<String, _>("compatibility")).unwrap_or_default(),
                metadata: row.get("metadata"),
                download_url: row.get("download_url"),
                size: row.get("size"),
                rating: row.get("rating"),
                review_count: row.get("review_count"),
            })
            .collect::<Vec<_>>();
            
        // Get total count
        let mut count_query = r#"
            SELECT COUNT(*) as total FROM extensions WHERE 1=1
        "#.to_string();
        
        let mut count_binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(query_str) = &request.query {
            count_query.push_str(" AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)");
            count_binds.push(&format!("%{}%", query_str));
            count_binds.push(&format!("%{}%", query_str));
            count_binds.push(&format!("%{}%", query_str));
        }
        
        if let Some(category) = &request.category {
            count_query.push_str(" AND category = ?");
            count_binds.push(category);
        }
        
        if let Some(tags) = &request.tags {
            count_query.push_str(" AND tags LIKE ?");
            count_binds.push(&format!("%{}%", tags.join("%")));
        }
        
        if let Some(author) = &request.author {
            count_query.push_str(" AND author = ?");
            count_binds.push(author);
        }
        
        if let Some(is_active) = request.is_active {
            count_query.push_str(" AND is_active = ?");
            count_binds.push(&is_active);
        }
        
        if let Some(is_system) = request.is_system {
            count_query.push_str(" AND is_system = ?");
            count_binds.push(&is_system);
        }
        
        let count_row = sqlx::query(&count_query)
            .bind(&count_binds)
            .fetch_one(&self.pool)
            .await?;
            
        let total: u64 = count_row.get("total");
        let has_more = total > (offset + limit) as u64;
        
        Ok(ExtensionSearchResponse {
            extensions,
            total,
            limit,
            offset,
            has_more,
        })
    }

    pub async fn install_extension(&self, request: ExtensionInstallationRequest) -> Result<ExtensionInstallationResponse, sqlx::Error> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        
        let query = r#"
            INSERT INTO extension_installations (id, extension_id, workspace_id, installation_status, update_status, installed_at, updated_at, version, metadata, install_path, is_system)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&id)
            .bind(&request.extension_id)
            .bind(&request.workspace_id)
            .bind("Installed")
            .bind("UpToDate")
            .bind(&now)
            .bind(&now)
            .bind(&request.version.unwrap_or("1.0.0".to_string()))
            .bind(serde_json::Value::Object(serde_json::Map::new()))
            .bind(None::<String>)
            .bind(request.is_system.unwrap_or(false))
            .fetch_one(&self.pool)
            .await?;

        Ok(ExtensionInstallationResponse {
            installation_id: row.get("id"),
            status: InstallationStatus::Installed,
            install_path: row.get("install_path"),
        })
    }

    pub async fn update_extension_installation(&self, id: &str, request: ExtensionUpdateRequest) -> Result<ExtensionUpdateResponse, sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        
        let query = r#"
            UPDATE extension_installations 
            SET update_status = ?, updated_at = ?, version = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind("Updated")
            .bind(&now)
            .bind(&request.version.unwrap_or("1.0.0".to_string()))
            .bind(id)
            .fetch_one(&self.pool)
            .await?;

        Ok(ExtensionUpdateResponse {
            update_id: row.get("id"),
            status: UpdateStatus::Updated,
            updated_version: Some(row.get("version")),
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
            workspace_id: row.get("workspace_id"),
            installation_status: match row.get::<String, _>("installation_status").as_str() {
                "Installed" => InstallationStatus::Installed,
                "Updated" => InstallationStatus::Updated,
                "Failed" => InstallationStatus::Failed,
                "Cancelled" => InstallationStatus::Cancelled,
                "Uninstalled" => InstallationStatus::Uninstalled,
                _ => InstallationStatus::Failed,
            },
            update_status: match row.get::<String, _>("update_status").as_str() {
                "Updated" => UpdateStatus::Updated,
                "UpToDate" => UpdateStatus::UpToDate,
                "Failed" => UpdateStatus::Failed,
                "Pending" => UpdateStatus::Pending,
                _ => UpdateStatus::Failed,
            },
            installed_at: row.get("installed_at"),
            updated_at: row.get("updated_at"),
            version: row.get("version"),
            metadata: row.get("metadata"),
            install_path: row.get("install_path"),
            is_system: row.get("is_system"),
        })
    }

    pub async fn register_capability(&self, capability: Capability) -> Result<Capability, sqlx::Error> {
        let query = r#"
            INSERT INTO capabilities (id, name, description, category, version, provider, is_active, is_system, dependencies, created_at, updated_at, metadata, is_public, visibility)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&capability.id)
            .bind(&capability.name)
            .bind(&capability.description)
            .bind(&capability.category)
            .bind(&capability.version)
            .bind(&capability.provider)
            .bind(capability.is_active)
            .bind(capability.is_system)
            .bind(serde_json::to_string(&capability.dependencies).unwrap_or_default())
            .bind(&capability.created_at)
            .bind(&capability.updated_at)
            .bind(&capability.metadata)
            .bind(capability.is_public)
            .bind(&capability.visibility)
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
            dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            metadata: row.get("metadata"),
            is_public: row.get("is_public"),
            visibility: row.get("visibility"),
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
            dependencies: serde_json::from_str(&row.get::<String, _>("dependencies")).unwrap_or_default(),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            metadata: row.get("metadata"),
            is_public: row.get("is_public"),
            visibility: row.get("visibility"),
        })
    }

    pub async fn get_marketplace_status(&self) -> Result<MarketplaceStatus, sqlx::Error> {
        // Get extension count
        let extension_count_query = r#"
            SELECT COUNT(*) as count FROM extensions
        "#;
        
        let extension_count_row = sqlx::query(extension_count_query)
            .fetch_one(&self.pool)
            .await?;
            
        let extension_count: u64 = extension_count_row.get("count");
        
        // Get capability count
        let capability_count_query = r#"
            SELECT COUNT(*) as count FROM capabilities
        "#;
        
        let capability_count_row = sqlx::query(capability_count_query)
            .fetch_one(&self.pool)
            .await?;
            
        let capability_count: u64 = capability_count_row.get("count");
        
        // Get installation count
        let installation_count_query = r#"
            SELECT COUNT(*) as count FROM extension_installations
        "#;
        
        let installation_count_row = sqlx::query(installation_count_query)
            .fetch_one(&self.pool)
            .await?;
            
        let installation_count: u64 = installation_count_row.get("count");
        
        Ok(MarketplaceStatus {
            total_extensions: extension_count,
            total_capabilities: capability_count,
            total_installations: installation_count,
            last_updated: chrono::Utc::now().to_rfc3339(),
        })
    }
    
    pub async fn get_extension_installations_by_workspace(&self, workspace_id: &str) -> Result<Vec<ExtensionInstallation>, sqlx::Error> {
        let query = r#"
            SELECT * FROM extension_installations WHERE workspace_id = ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(workspace_id)
            .fetch_all(&self.pool)
            .await?;
            
        let installations = rows
            .into_iter()
            .map(|row| ExtensionInstallation {
                id: row.get("id"),
                extension_id: row.get("extension_id"),
                workspace_id: row.get("workspace_id"),
                installation_status: match row.get::<String, _>("installation_status").as_str() {
                    "Installed" => InstallationStatus::Installed,
                    "Updated" => InstallationStatus::Updated,
                    "Failed" => InstallationStatus::Failed,
                    "Cancelled" => InstallationStatus::Cancelled,
                    "Uninstalled" => InstallationStatus::Uninstalled,
                    _ => InstallationStatus::Failed,
                },
                update_status: match row.get::<String, _>("update_status").as_str() {
                    "Updated" => UpdateStatus::Updated,
                    "UpToDate" => UpdateStatus::UpToDate,
                    "Failed" => UpdateStatus::Failed,
                    "Pending" => UpdateStatus::Pending,
                    _ => UpdateStatus::Failed,
                },
                installed_at: row.get("installed_at"),
                updated_at: row.get("updated_at"),
                version: row.get("version"),
                metadata: row.get("metadata"),
                install_path: row.get("install_path"),
                is_system: row.get("is_system"),
            })
            .collect::<Vec<_>>();
            
        Ok(installations)
    }
    
    pub async fn update_extension_status(&self, extension_id: &str, is_active: bool) -> Result<(), sqlx::Error> {
        let query = r#"
            UPDATE extensions SET is_active = ?, updated_at = ? WHERE id = ?
        "#;
        
        let now = chrono::Utc::now().to_rfc3339();
        
        sqlx::query(query)
            .bind(is_active)
            .bind(&now)
            .bind(extension_id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
    
    pub async fn get_extension_installation_by_workspace_and_extension(&self, workspace_id: &str, extension_id: &str) -> Result<Option<ExtensionInstallation>, sqlx::Error> {
        let query = r#"
            SELECT * FROM extension_installations WHERE workspace_id = ? AND extension_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(workspace_id)
            .bind(extension_id)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                Ok(Some(ExtensionInstallation {
                    id: row.get("id"),
                    extension_id: row.get("extension_id"),
                    workspace_id: row.get("workspace_id"),
                    installation_status: match row.get::<String, _>("installation_status").as_str() {
                        "Installed" => InstallationStatus::Installed,
                        "Updated" => InstallationStatus::Updated,
                        "Failed" => InstallationStatus::Failed,
                        "Cancelled" => InstallationStatus::Cancelled,
                        "Uninstalled" => InstallationStatus::Uninstalled,
                        _ => InstallationStatus::Failed,
                    },
                    update_status: match row.get::<String, _>("update_status").as_str() {
                        "Updated" => UpdateStatus::Updated,
                        "UpToDate" => UpdateStatus::UpToDate,
                        "Failed" => UpdateStatus::Failed,
                        "Pending" => UpdateStatus::Pending,
                        _ => UpdateStatus::Failed,
                    },
                    installed_at: row.get("installed_at"),
                    updated_at: row.get("updated_at"),
                    version: row.get("version"),
                    metadata: row.get("metadata"),
                    install_path: row.get("install_path"),
                    is_system: row.get("is_system"),
                }))
            }
            Err(sqlx::Error::RowNotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceStatus {
    pub total_extensions: u64,
    pub total_capabilities: u64,
    pub total_installations: u64,
    pub last_updated: String,
}

// Marketplace orchestration service
pub struct MarketplaceOrchestrationService {
    db: MarketplaceDatabase,
}

impl MarketplaceOrchestrationService {
    pub fn new(db: MarketplaceDatabase) -> Self {
        MarketplaceOrchestrationService { db }
    }

    pub async fn install_extension(&self, request: ExtensionInstallationRequest) -> Result<ExtensionInstallationResponse, Box<dyn std::error::Error>> {
        // Validate that the extension exists
        let extension = self.db.get_extension(&request.extension_id).await?;
        
        // Check if extension is already installed in this workspace
        let existing_installation = self.db.get_extension_installation_by_workspace_and_extension(&request.workspace_id, &request.extension_id).await?;
        
        if let Some(_) = existing_installation {
            // Extension already installed, update it instead
            return self.update_extension_installation(request).await;
        }
        
        // Create installation record
        let response = self.db.install_extension(request).await?;
        
        // Log lifecycle event
        self.log_lifecycle_event(&extension.id, ExtensionLifecycleEventType::Installed, serde_json::json!({
            "workspace_id": response.installation_id,
            "status": "installed"
        })).await?;
        
        Ok(response)
    }

    pub async fn update_extension(&self, request: ExtensionUpdateRequest) -> Result<ExtensionUpdateResponse, Box<dyn std::error::Error>> {
        // Validate that the extension exists
        let extension = self.db.get_extension(&request.extension_id).await?;
        
        // Get current installation
        let installation = self.db.get_extension_installation_by_workspace_and_extension(&request.workspace_id, &request.extension_id).await?;
        
        if installation.is_none() {
            return Err("Extension not installed in this workspace".into());
        }
        
        // Perform update
        let response = self.db.update_extension_installation(&installation.unwrap().id, request).await?;
        
        // Log lifecycle event
        self.log_lifecycle_event(&extension.id, ExtensionLifecycleEventType::Updated, serde_json::json!({
            "workspace_id": request.workspace_id,
            "status": "updated",
            "version": response.updated_version
        })).await?;
        
        Ok(response)
    }

    pub async fn uninstall_extension(&self, workspace_id: &str, extension_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Get current installation
        let installation = self.db.get_extension_installation_by_workspace_and_extension(workspace_id, extension_id).await?;
        
        if let Some(installation) = installation {
            // Update installation status to uninstalled
            let query = r#"
                UPDATE extension_installations 
                SET installation_status = ?, updated_at = ?
                WHERE id = ?
            "#;
            
            let now = chrono::Utc::now().to_rfc3339();
            
            sqlx::query(query)
                .bind("Uninstalled")
                .bind(&now)
                .bind(&installation.id)
                .execute(&self.db.pool)
                .await?;
                
            // Log lifecycle event
            self.log_lifecycle_event(extension_id, ExtensionLifecycleEventType::Uninstalled, serde_json::json!({
                "workspace_id": workspace_id,
                "status": "uninstalled"
            })).await?;
        }
        
        Ok(())
    }

    pub async fn enable_extension(&self, extension_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Update extension status to active
        self.db.update_extension_status(extension_id, true).await?;
        
        // Log lifecycle event
        self.log_lifecycle_event(extension_id, ExtensionLifecycleEventType::Enabled, serde_json::json!({
            "status": "enabled"
        })).await?;
        
        Ok(())
    }

    pub async fn disable_extension(&self, extension_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Update extension status to inactive
        self.db.update_extension_status(extension_id, false).await?;
        
        // Log lifecycle event
        self.log_lifecycle_event(extension_id, ExtensionLifecycleEventType::Disabled, serde_json::json!({
            "status": "disabled"
        })).await?;
        
        Ok(())
    }

    pub async fn validate_extension_dependencies(&self, extension_id: &str) -> Result<bool, Box<dyn std::error::Error>> {
        // Get the extension
        let extension = self.db.get_extension(extension_id).await?;
        
        // Check if all dependencies are satisfied
        for dep in &extension.dependencies {
            // Check if dependency exists and is active
            if let Ok(dep_extension) = self.db.get_extension(dep).await {
                if !dep_extension.is_active {
                    return Ok(false);
                }
            } else {
                // Dependency not found
                return Ok(false);
            }
        }
        
        Ok(true)
    }

    pub async fn validate_extension_compatibility(&self, extension_id: &str, platform: &str, version: &str) -> Result<bool, Box<dyn std::error::Error>> {
        // Get the extension
        let extension = self.db.get_extension(extension_id).await?;
        
        // Check compatibility
        if extension.compatibility.platform != platform {
            return Ok(false);
        }
        
        // Check version compatibility
        if extension.compatibility.min_version > version {
            return Ok(false);
        }
        
        if let Some(max_version) = &extension.compatibility.max_version {
            if max_version < version {
                return Ok(false);
            }
        }
        
        Ok(true)
    }

    async fn log_lifecycle_event(&self, extension_id: &str, event_type: ExtensionLifecycleEventType, metadata: serde_json::Value) -> Result<(), sqlx::Error> {
        // In a real implementation, this would log to a dedicated events table
        // For now, we'll just return Ok(())
        Ok(())
    }
}

// Initialize marketplace schema
pub async fn init_marketplace_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let create_extensions_table = r#"
        CREATE TABLE IF NOT EXISTS extensions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            description TEXT,
            author TEXT NOT NULL,
            author_id TEXT NOT NULL,
            category TEXT,
            tags TEXT,
            is_active INTEGER DEFAULT 1,
            is_system INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            installed_at TEXT,
            updated_at_version TEXT,
            dependencies TEXT,
            compatibility TEXT,
            metadata TEXT,
            download_url TEXT,
            size INTEGER,
            rating REAL,
            review_count INTEGER
        )
    "#;

    let create_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS capabilities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            version TEXT NOT NULL,
            provider TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            is_system INTEGER DEFAULT 0,
            dependencies TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            metadata TEXT,
            is_public INTEGER DEFAULT 1,
            visibility TEXT DEFAULT 'public'
        )
    "#;

    let create_extension_installations_table = r#"
        CREATE TABLE IF NOT EXISTS extension_installations (
            id TEXT PRIMARY KEY,
            extension_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            installation_status TEXT NOT NULL,
            update_status TEXT NOT NULL,
            installed_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            version TEXT NOT NULL,
            metadata TEXT,
            install_path TEXT,
            is_system INTEGER DEFAULT 0
        )
    "#;

    let create_extension_updates_table = r#"
        CREATE TABLE IF NOT EXISTS extension_updates (
            id TEXT PRIMARY KEY,
            extension_id TEXT NOT NULL,
            version TEXT NOT NULL,
            status TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            metadata TEXT,
            update_notes TEXT,
            release_notes TEXT
        )
    "#;

    sqlx::query(create_extensions_table).execute(pool).await?;
    sqlx::query(create_capabilities_table).execute(pool).await?;
    sqlx::query(create_extension_installations_table).execute(pool).await?;
    sqlx::query(create_extension_updates_table).execute(pool).await?;

    Ok(())
}
