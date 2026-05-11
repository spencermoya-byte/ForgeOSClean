use sqlx::{SqlitePool, Row};
use crate::commands::resource::{Resource, CreateResourceRequest, UpdateResourceRequest};

pub struct ResourceDatabase {
    pool: SqlitePool,
}

impl ResourceDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        ResourceDatabase { pool }
    }

    pub async fn create_resource(&self, request: CreateResourceRequest) -> Result<Resource, sqlx::Error> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        
        let resource = Resource {
            id: id.clone(),
            name: request.name,
            description: request.description,
            created_at: now.clone(),
            updated_at: now,
        };
        
        let query = r#"
            INSERT INTO resources (id, name, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        "#;
        
        sqlx::query(query)
            .bind(&resource.id)
            .bind(&resource.name)
            .bind(&resource.description)
            .bind(&resource.created_at)
            .bind(&resource.updated_at)
            .execute(&self.pool)
            .await?;
            
        Ok(resource)
    }

    pub async fn get_resources(&self) -> Result<Vec<Resource>, sqlx::Error> {
        let query = r#"
            SELECT id, name, description, created_at, updated_at
            FROM resources
            ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .fetch_all(&self.pool)
            .await?;
            
        let mut resources = Vec::new();
        for row in rows {
            let resource = Resource {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            };
            resources.push(resource);
        }
        
        Ok(resources)
    }

    pub async fn get_resource(&self, id: &str) -> Result<Resource, sqlx::Error> {
        let query = r#"
            SELECT id, name, description, created_at, updated_at
            FROM resources
            WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        let resource = Resource {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        };
        
        Ok(resource)
    }

    pub async fn update_resource(&self, id: &str, request: UpdateResourceRequest) -> Result<Resource, sqlx::Error> {
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
        
        query.push_str("updated_at = ?");
        binds.push(now);
        
        let query = format!("UPDATE resources SET {} WHERE id = ?", query);
        
        sqlx::query(&query)
            .bind(&binds)
            .execute(&self.pool)
            .await?;
            
        self.get_resource(id).await
    }

    pub async fn delete_resource(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM resources
            WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }
}
