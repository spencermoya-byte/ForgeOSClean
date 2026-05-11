use sqlx::{SqlitePool, Row};
use crate::commands::workspace::{Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest};

pub struct WorkspaceDatabase {
    pool: SqlitePool,
}

impl WorkspaceDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        WorkspaceDatabase { pool }
    }

    pub async fn create_workspace(&self, request: CreateWorkspaceRequest) -> Result<Workspace, sqlx::Error> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        
        let workspace = Workspace {
            id: id.clone(),
            name: request.name,
            description: request.description,
            path: request.path,
            is_active: false,
            created_at: now.clone(),
            updated_at: now,
        };
        
        let query = r#"
            INSERT INTO workspaces (id, name, description, path, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        "#;
        
        sqlx::query(query)
            .bind(&workspace.id)
            .bind(&workspace.name)
            .bind(&workspace.description)
            .bind(&workspace.path)
            .bind(&workspace.is_active)
            .bind(&workspace.created_at)
            .bind(&workspace.updated_at)
            .execute(&self.pool)
            .await?;
            
        Ok(workspace)
    }

    pub async fn get_workspaces(&self) -> Result<Vec<Workspace>, sqlx::Error> {
        let query = r#"
            SELECT id, name, description, path, is_active, created_at, updated_at
            FROM workspaces
            ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .fetch_all(&self.pool)
            .await?;
            
        let mut workspaces = Vec::new();
        for row in rows {
            let workspace = Workspace {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                path: row.get("path"),
                is_active: row.get("is_active"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            workspaces.push(workspace);
        }
        
        Ok(workspaces)
    }

    pub async fn get_workspace(&self, id: &str) -> Result<Workspace, sqlx::Error> {
        let query = r#"
            SELECT id, name, description, path, is_active, created_at, updated_at
            FROM workspaces
            WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        let workspace = Workspace {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            path: row.get("path"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        };
        
        Ok(workspace)
    }

    pub async fn update_workspace(&self, id: &str, request: UpdateWorkspaceRequest) -> Result<Workspace, sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        
        let mut query = String::new();
        let mut binds = vec![id.to_string()];
        
        if let Some(name) = &request.name {
            query.push_str("name = ?, ");
            binds.push(name.clone());
        }
        
        if let Some(description) = &request.description {
            query.push_str("description = ?, ");
            binds.push(description.clone());
        }
        
        if let Some(path) = &request.path {
            query.push_str("path = ?, ");
            binds.push(path.clone());
        }
        
        if let Some(is_active) = request.is_active {
            query.push_str("is_active = ?, ");
            binds.push(is_active);
        }
        
        query.push_str("updated_at = ?");
        binds.push(now);
        
        let query = format!("UPDATE workspaces SET {} WHERE id = ?", query);
        
        sqlx::query(&query)
            .bind(&binds)
            .execute(&self.pool)
            .await?;
            
        self.get_workspace(id).await
    }

    pub async fn delete_workspace(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM workspaces
            WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
    
    pub async fn set_active_workspace(&self, id: &str) -> Result<(), sqlx::Error> {
        // First, set all workspaces to inactive
        sqlx::query("UPDATE workspaces SET is_active = 0")
            .execute(&self.pool)
            .await?;
            
        // Then set the specified workspace to active
        sqlx::query("UPDATE workspaces SET is_active = 1 WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
    
    pub async fn get_active_workspace(&self) -> Result<Option<Workspace>, sqlx::Error> {
        let query = r#"
            SELECT id, name, description, path, is_active, created_at, updated_at
            FROM workspaces
            WHERE is_active = 1
        "#;
        
        let row = sqlx::query(query)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                let workspace = Workspace {
                    id: row.get("id"),
                    name: row.get("name"),
                    description: row.get("description"),
                    path: row.get("path"),
                    is_active: row.get("is_active"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                };
                Ok(Some(workspace))
            }
            Err(_) => Ok(None),
        }
    }
}
