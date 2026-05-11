use sqlx::{SqlitePool, Row};
use crate::commands::project::{Project, CreateProjectRequest, UpdateProjectRequest};

pub struct ProjectDatabase {
    pool: SqlitePool,
}

impl ProjectDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        ProjectDatabase { pool }
    }

    pub async fn create_project(&self, request: CreateProjectRequest) -> Result<Project, sqlx::Error> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        
        let project = Project {
            id: id.clone(),
            workspace_id: request.workspace_id,
            name: request.name,
            description: request.description,
            is_active: false,
            created_at: now.clone(),
            updated_at: now,
        };
        
        let query = r#"
            INSERT INTO projects (id, workspace_id, name, description, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        "#;
        
        sqlx::query(query)
            .bind(&project.id)
            .bind(&project.workspace_id)
            .bind(&project.name)
            .bind(&project.description)
            .bind(&project.is_active)
            .bind(&project.created_at)
            .bind(&project.updated_at)
            .execute(&self.pool)
            .await?;
            
        Ok(project)
    }

    pub async fn get_projects(&self, workspace_id: &str) -> Result<Vec<Project>, sqlx::Error> {
        let query = r#"
            SELECT id, workspace_id, name, description, is_active, created_at, updated_at
            FROM projects
            WHERE workspace_id = ?
            ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(workspace_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut projects = Vec::new();
        for row in rows {
            let project = Project {
                id: row.get("id"),
                workspace_id: row.get("workspace_id"),
                name: row.get("name"),
                description: row.get("description"),
                is_active: row.get("is_active"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            projects.push(project);
        }
        
        Ok(projects)
    }

    pub async fn get_project(&self, id: &str) -> Result<Project, sqlx::Error> {
        let query = r#"
            SELECT id, workspace_id, name, description, is_active, created_at, updated_at
            FROM projects
            WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        let project = Project {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            name: row.get("name"),
            description: row.get("description"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        };
        
        Ok(project)
    }

    pub async fn update_project(&self, id: &str, request: UpdateProjectRequest) -> Result<Project, sqlx::Error> {
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
        
        if let Some(is_active) = request.is_active {
            query.push_str("is_active = ?, ");
            binds.push(is_active);
        }
        
        query.push_str("updated_at = ?");
        binds.push(now);
        
        let query = format!("UPDATE projects SET {} WHERE id = ?", query);
        
        sqlx::query(&query)
            .bind(&binds)
            .execute(&self.pool)
            .await?;
            
        self.get_project(id).await
    }

    pub async fn delete_project(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM projects
            WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
    
    pub async fn set_active_project(&self, id: &str) -> Result<(), sqlx::Error> {
        // First, set all projects to inactive
        sqlx::query("UPDATE projects SET is_active = 0")
            .execute(&self.pool)
            .await?;
            
        // Then set the specified project to active
        sqlx::query("UPDATE projects SET is_active = 1 WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
    
    pub async fn get_active_project(&self) -> Result<Option<Project>, sqlx::Error> {
        let query = r#"
            SELECT id, workspace_id, name, description, is_active, created_at, updated_at
            FROM projects
            WHERE is_active = 1
        "#;
        
        let row = sqlx::query(query)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => {
                let project = Project {
                    id: row.get("id"),
                    workspace_id: row.get("workspace_id"),
                    name: row.get("name"),
                    description: row.get("description"),
                    is_active: row.get("is_active"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                };
                Ok(Some(project))
            }
            Err(_) => Ok(None),
        }
    }
}
