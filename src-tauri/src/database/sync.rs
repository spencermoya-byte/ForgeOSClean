use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct SyncMetadata {
    pub id: String,
    pub resource_id: String,
    pub workspace_id: String,
    pub project_id: String,
    pub last_synced: String,
    pub sync_status: String,
    pub version: i32,
    pub remote_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct DeviceMetadata {
    pub id: String,
    pub device_name: String,
    pub device_type: String,
    pub platform: String,
    pub last_seen: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct SyncQueueItem {
    pub id: String,
    pub resource_id: String,
    pub workspace_id: String,
    pub project_id: String,
    pub operation: String,
    pub payload: String,
    pub status: String,
    pub priority: i32,
    pub created_at: String,
    pub updated_at: String,
}

pub struct SyncDatabase {
    pool: SqlitePool,
}

impl SyncDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        SyncDatabase { pool }
    }

    pub async fn get_sync_metadata(&self, resource_id: &str) -> Result<Option<SyncMetadata>, sqlx::Error> {
        let query = r#"
            SELECT id, resource_id, workspace_id, project_id, last_synced, sync_status, version, remote_id, created_at, updated_at
            FROM sync_metadata
            WHERE resource_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(resource_id)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                let metadata = SyncMetadata {
                    id: row.get("id"),
                    resource_id: row.get("resource_id"),
                    workspace_id: row.get("workspace_id"),
                    project_id: row.get("project_id"),
                    last_synced: row.get("last_synced"),
                    sync_status: row.get("sync_status"),
                    version: row.get("version"),
                    remote_id: row.get("remote_id"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                };
                Ok(Some(metadata))
            }
            Err(_) => Ok(None),
        }
    }

    pub async fn update_sync_metadata(&self, metadata: SyncMetadata) -> Result<SyncMetadata, sqlx::Error> {
        let query = r#"
            INSERT OR REPLACE INTO sync_metadata (id, resource_id, workspace_id, project_id, last_synced, sync_status, version, remote_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metadata.id)
            .bind(&metadata.resource_id)
            .bind(&metadata.workspace_id)
            .bind(&metadata.project_id)
            .bind(&metadata.last_synced)
            .bind(&metadata.sync_status)
            .bind(&metadata.version)
            .bind(&metadata.remote_id)
            .bind(&metadata.created_at)
            .bind(&metadata.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SyncMetadata {
            id: row.get("id"),
            resource_id: row.get("resource_id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            last_synced: row.get("last_synced"),
            sync_status: row.get("sync_status"),
            version: row.get("version"),
            remote_id: row.get("remote_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_sync_queue_items(&self, status: Option<&str>, limit: Option<u32>) -> Result<Vec<SyncQueueItem>, sqlx::Error> {
        let mut query = r#"
            SELECT id, resource_id, workspace_id, project_id, operation, payload, status, priority, created_at, updated_at
            FROM sync_queue
            WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(status) = status {
            query.push_str(" AND status = ?");
            binds.push(status);
        }
        
        query.push_str(" ORDER BY priority DESC, created_at ASC");
        
        if let Some(limit) = limit {
            query.push_str(" LIMIT ?");
            binds.push(limit);
        }
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut items = Vec::new();
        for row in rows {
            let item = SyncQueueItem {
                id: row.get("id"),
                resource_id: row.get("resource_id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                operation: row.get("operation"),
                payload: row.get("payload"),
                status: row.get("status"),
                priority: row.get("priority"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            items.push(item);
        }
        
        Ok(items)
    }

    pub async fn add_sync_queue_item(&self, item: SyncQueueItem) -> Result<SyncQueueItem, sqlx::Error> {
        let query = r#"
            INSERT INTO sync_queue (id, resource_id, workspace_id, project_id, operation, payload, status, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&item.id)
            .bind(&item.resource_id)
            .bind(&item.workspace_id)
            .bind(&item.project_id)
            .bind(&item.operation)
            .bind(&item.payload)
            .bind(&item.status)
            .bind(&item.priority)
            .bind(&item.created_at)
            .bind(&item.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SyncQueueItem {
            id: row.get("id"),
            resource_id: row.get("resource_id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            operation: row.get("operation"),
            payload: row.get("payload"),
            status: row.get("status"),
            priority: row.get("priority"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_sync_queue_item(&self, id: &str, status: &str) -> Result<SyncQueueItem, sqlx::Error> {
        let query = r#"
            UPDATE sync_queue 
            SET status = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(status)
            .bind(chrono::Utc::now().to_rfc3339())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SyncQueueItem {
            id: row.get("id"),
            resource_id: row.get("resource_id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            operation: row.get("operation"),
            payload: row.get("payload"),
            status: row.get("status"),
            priority: row.get("priority"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_device_metadata(&self, device_id: &str) -> Result<Option<DeviceMetadata>, sqlx::Error> {
        let query = r#"
            SELECT id, device_name, device_type, platform, last_seen, is_active, created_at, updated_at
            FROM devices
            WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(device_id)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                let metadata = DeviceMetadata {
                    id: row.get("id"),
                    device_name: row.get("device_name"),
                    device_type: row.get("device_type"),
                    platform: row.get("platform"),
                    last_seen: row.get("last_seen"),
                    is_active: row.get("is_active"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                };
                Ok(Some(metadata))
            }
            Err(_) => Ok(None),
        }
    }

    pub async fn update_device_metadata(&self, metadata: DeviceMetadata) -> Result<DeviceMetadata, sqlx::Error> {
        let query = r#"
            INSERT OR REPLACE INTO devices (id, device_name, device_type, platform, last_seen, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metadata.id)
            .bind(&metadata.device_name)
            .bind(&metadata.device_type)
            .bind(&metadata.platform)
            .bind(&metadata.last_seen)
            .bind(&metadata.is_active)
            .bind(&metadata.created_at)
            .bind(&metadata.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(DeviceMetadata {
            id: row.get("id"),
            device_name: row.get("device_name"),
            device_type: row.get("device_type"),
            platform: row.get("platform"),
            last_seen: row.get("last_seen"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_sync_history(&self, resource_id: Option<&str>, limit: Option<u32>) -> Result<Vec<SyncMetadata>, sqlx::Error> {
        let mut query = r#"
            SELECT id, resource_id, workspace_id, project_id, last_synced, sync_status, version, remote_id, created_at, updated_at
            FROM sync_metadata
            WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(resource_id) = resource_id {
            query.push_str(" AND resource_id = ?");
            binds.push(resource_id);
        }
        
        query.push_str(" ORDER BY updated_at DESC");
        
        if let Some(limit) = limit {
            query.push_str(" LIMIT ?");
            binds.push(limit);
        }
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut history = Vec::new();
        for row in rows {
            let item = SyncMetadata {
                id: row.get("id"),
                resource_id: row.get("resource_id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                last_synced: row.get("last_synced"),
                sync_status: row.get("sync_status"),
                version: row.get("version"),
                remote_id: row.get("remote_id"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            history.push(item);
        }
        
        Ok(history)
    }
}
