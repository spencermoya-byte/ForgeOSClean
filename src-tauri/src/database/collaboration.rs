use sqlx::{SqlitePool, Row};
use crate::commands::workspace::{Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest};

pub struct CollaborationDatabase {
    pool: SqlitePool,
}

impl CollaborationDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        CollaborationDatabase { pool }
    }

    pub async fn get_workspace_members(&self, workspace_id: &str) -> Result<Vec<WorkspaceMember>, sqlx::Error> {
        let query = r#"
            SELECT id, workspace_id, user_id, role, is_active, created_at, updated_at
            FROM workspace_members
            WHERE workspace_id = ?
            ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(workspace_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut members = Vec::new();
        for row in rows {
            let member = WorkspaceMember {
                id: row.get("id"),
                workspace_id: row.get("workspace_id"),
                user_id: row.get("user_id"),
                role: row.get("role"),
                is_active: row.get("is_active"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            members.push(member);
        }
        
        Ok(members)
    }

    pub async fn add_workspace_member(&self, member: WorkspaceMember) -> Result<WorkspaceMember, sqlx::Error> {
        let query = r#"
            INSERT INTO workspace_members (id, workspace_id, user_id, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&member.id)
            .bind(&member.workspace_id)
            .bind(&member.user_id)
            .bind(&member.role)
            .bind(&member.is_active)
            .bind(&member.created_at)
            .bind(&member.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(WorkspaceMember {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            user_id: row.get("user_id"),
            role: row.get("role"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_workspace_member(&self, id: &str, role: &str) -> Result<WorkspaceMember, sqlx::Error> {
        let query = r#"
            UPDATE workspace_members 
            SET role = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(role)
            .bind(chrono::Utc::now().to_rfc3339())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(WorkspaceMember {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            user_id: row.get("user_id"),
            role: row.get("role"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn remove_workspace_member(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM workspace_members WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn get_activity_log(&self, workspace_id: Option<&str>, project_id: Option<&str>, resource_id: Option<&str>, limit: Option<u32>) -> Result<Vec<ActivityLogEntry>, sqlx::Error> {
        let mut query = r#"
            SELECT id, workspace_id, project_id, resource_id, user_id, action, details, created_at
            FROM activity_log
            WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        if let Some(resource_id) = resource_id {
            query.push_str(" AND resource_id = ?");
            binds.push(resource_id);
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        if let Some(limit) = limit {
            query.push_str(" LIMIT ?");
            binds.push(limit);
        }
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut activities = Vec::new();
        for row in rows {
            let activity = ActivityLogEntry {
                id: row.get("id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                resource_id: row.get("resource_id"),
                user_id: row.get("user_id"),
                action: row.get("action"),
                details: row.get("details"),
                created_at: row.get("created_at"),
            };
            activities.push(activity);
        }
        
        Ok(activities)
    }

    pub async fn log_activity(&self, activity: ActivityLogEntry) -> Result<ActivityLogEntry, sqlx::Error> {
        let query = r#"
            INSERT INTO activity_log (id, workspace_id, project_id, resource_id, user_id, action, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&activity.id)
            .bind(&activity.workspace_id)
            .bind(&activity.project_id)
            .bind(&activity.resource_id)
            .bind(&activity.user_id)
            .bind(&activity.action)
            .bind(&activity.details)
            .bind(&activity.created_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ActivityLogEntry {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            resource_id: row.get("resource_id"),
            user_id: row.get("user_id"),
            action: row.get("action"),
            details: row.get("details"),
            created_at: row.get("created_at"),
        })
    }

    pub async fn get_sync_metadata(&self, resource_id: &str) -> Result<Option<SyncMetadata>, sqlx::Error> {
        let query = r#"
            SELECT id, resource_id, workspace_id, project_id, last_synced, sync_status, version, created_at, updated_at
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
            INSERT OR REPLACE INTO sync_metadata (id, resource_id, workspace_id, project_id, last_synced, sync_status, version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_presence(&self, user_id: &str) -> Result<Option<Presence>, sqlx::Error> {
        let query = r#"
            SELECT id, user_id, workspace_id, status, last_seen, created_at, updated_at
            FROM presence
            WHERE user_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(user_id)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                let presence = Presence {
                    id: row.get("id"),
                    user_id: row.get("user_id"),
                    workspace_id: row.get("workspace_id"),
                    status: row.get("status"),
                    last_seen: row.get("last_seen"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                };
                Ok(Some(presence))
            }
            Err(_) => Ok(None),
        }
    }

    pub async fn update_presence(&self, presence: Presence) -> Result<Presence, sqlx::Error> {
        let query = r#"
            INSERT OR REPLACE INTO presence (id, user_id, workspace_id, status, last_seen, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&presence.id)
            .bind(&presence.user_id)
            .bind(&presence.workspace_id)
            .bind(&presence.status)
            .bind(&presence.last_seen)
            .bind(&presence.created_at)
            .bind(&presence.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Presence {
            id: row.get("id"),
            user_id: row.get("user_id"),
            workspace_id: row.get("workspace_id"),
            status: row.get("status"),
            last_seen: row.get("last_seen"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}

#[derive(Debug, Clone)]
pub struct WorkspaceMember {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ActivityLogEntry {
    pub id: String,
    pub workspace_id: String,
    pub project_id: String,
    pub resource_id: String,
    pub user_id: String,
    pub action: String,
    pub details: String,
    pub created_at: String,
}

#[derive(Debug, Clone)]
pub struct SyncMetadata {
    pub id: String,
    pub resource_id: String,
    pub workspace_id: String,
    pub project_id: String,
    pub last_synced: String,
    pub sync_status: String,
    pub version: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct Presence {
    pub id: String,
    pub user_id: String,
    pub workspace_id: String,
    pub status: String,
    pub last_seen: String,
    pub created_at: String,
    pub updated_at: String,
}
