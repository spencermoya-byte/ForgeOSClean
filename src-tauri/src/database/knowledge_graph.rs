use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct GraphEntity {
    pub id: String,
    pub entity_type: String, // "workspace", "project", "resource", "ai_session", "workflow", "plugin", "agent"
    pub name: String,
    pub description: String,
    pub metadata: String, // JSON string
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct GraphRelationship {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub relationship_type: String, // "contains", "uses", "depends_on", "related_to", "references"
    pub weight: f32,
    pub metadata: String, // JSON string
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ContextualMetadata {
    pub id: String,
    pub entity_id: String,
    pub key: String,
    pub value: String,
    pub created_at: String,
    pub updated_at: String,
}

pub struct KnowledgeGraphDatabase {
    pool: SqlitePool,
}

impl KnowledgeGraphDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        KnowledgeGraphDatabase { pool }
    }

    pub async fn create_entity(&self, entity: GraphEntity) -> Result<GraphEntity, sqlx::Error> {
        let query = r#"
            INSERT INTO graph_entities (id, entity_type, name, description, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&entity.id)
            .bind(&entity.entity_type)
            .bind(&entity.name)
            .bind(&entity.description)
            .bind(&entity.metadata)
            .bind(&entity.created_at)
            .bind(&entity.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(GraphEntity {
            id: row.get("id"),
            entity_type: row.get("entity_type"),
            name: row.get("name"),
            description: row.get("description"),
            metadata: row.get("metadata"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_entity(&self, id: &str) -> Result<GraphEntity, sqlx::Error> {
        let query = r#"
            SELECT * FROM graph_entities WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(GraphEntity {
            id: row.get("id"),
            entity_type: row.get("entity_type"),
            name: row.get("name"),
            description: row.get("description"),
            metadata: row.get("metadata"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_entities(&self, entity_types: Option<&[String]>) -> Result<Vec<GraphEntity>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM graph_entities
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(types) = entity_types {
            if !types.is_empty() {
                query.push_str(" WHERE entity_type IN (");
                query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut entities = Vec::new();
        for row in rows {
            entities.push(GraphEntity {
                id: row.get("id"),
                entity_type: row.get("entity_type"),
                name: row.get("name"),
                description: row.get("description"),
                metadata: row.get("metadata"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(entities)
    }

    pub async fn update_entity(&self, id: &str, entity: GraphEntity) -> Result<GraphEntity, sqlx::Error> {
        let query = r#"
            UPDATE graph_entities 
            SET entity_type = ?, name = ?, description = ?, metadata = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&entity.entity_type)
            .bind(&entity.name)
            .bind(&entity.description)
            .bind(&entity.metadata)
            .bind(&entity.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(GraphEntity {
            id: row.get("id"),
            entity_type: row.get("entity_type"),
            name: row.get("name"),
            description: row.get("description"),
            metadata: row.get("metadata"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_entity(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM graph_entities WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_relationship(&self, relationship: GraphRelationship) -> Result<GraphRelationship, sqlx::Error> {
        let query = r#"
            INSERT INTO graph_relationships (id, source_id, target_id, relationship_type, weight, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&relationship.id)
            .bind(&relationship.source_id)
            .bind(&relationship.target_id)
            .bind(&relationship.relationship_type)
            .bind(&relationship.weight)
            .bind(&relationship.metadata)
            .bind(&relationship.created_at)
            .bind(&relationship.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(GraphRelationship {
            id: row.get("id"),
            source_id: row.get("source_id"),
            target_id: row.get("target_id"),
            relationship_type: row.get("relationship_type"),
            weight: row.get("weight"),
            metadata: row.get("metadata"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_relationships(&self, source_id: Option<&str>, target_id: Option<&str>, relationship_types: Option<&[String]>) -> Result<Vec<GraphRelationship>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM graph_relationships WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(source_id) = source_id {
            query.push_str(" AND source_id = ?");
            binds.push(source_id);
        }
        
        if let Some(target_id) = target_id {
            query.push_str(" AND target_id = ?");
            binds.push(target_id);
        }
        
        if let Some(types) = relationship_types {
            if !types.is_empty() {
                query.push_str(" AND relationship_type IN (");
                query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut relationships = Vec::new();
        for row in rows {
            relationships.push(GraphRelationship {
                id: row.get("id"),
                source_id: row.get("source_id"),
                target_id: row.get("target_id"),
                relationship_type: row.get("relationship_type"),
                weight: row.get("weight"),
                metadata: row.get("metadata"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(relationships)
    }

    pub async fn create_contextual_metadata(&self, metadata: ContextualMetadata) -> Result<ContextualMetadata, sqlx::Error> {
        let query = r#"
            INSERT INTO contextual_metadata (id, entity_id, key, value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metadata.id)
            .bind(&metadata.entity_id)
            .bind(&metadata.key)
            .bind(&metadata.value)
            .bind(&metadata.created_at)
            .bind(&metadata.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ContextualMetadata {
            id: row.get("id"),
            entity_id: row.get("entity_id"),
            key: row.get("key"),
            value: row.get("value"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_contextual_metadata(&self, entity_id: &str) -> Result<Vec<ContextualMetadata>, sqlx::Error> {
        let query = r#"
            SELECT * FROM contextual_metadata WHERE entity_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(entity_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut metadata = Vec::new();
        for row in rows {
            metadata.push(ContextualMetadata {
                id: row.get("id"),
                entity_id: row.get("entity_id"),
                key: row.get("key"),
                value: row.get("value"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(metadata)
    }

    pub async fn search_entities(&self, query: &str, entity_types: Option<&[String]>, limit: i32) -> Result<Vec<GraphEntity>, sqlx::Error> {
        let mut search_query = r#"
            SELECT * FROM graph_entities 
            WHERE name LIKE ? OR description LIKE ?
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![
            &format!("%{}%", query),
            &format!("%{}%", query)
        ];
        
        if let Some(types) = entity_types {
            if !types.is_empty() {
                search_query.push_str(" AND entity_type IN (");
                search_query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                search_query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        search_query.push_str(" ORDER BY created_at DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&search_query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut entities = Vec::new();
        for row in rows {
            entities.push(GraphEntity {
                id: row.get("id"),
                entity_type: row.get("entity_type"),
                name: row.get("name"),
                description: row.get("description"),
                metadata: row.get("metadata"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(entities)
    }

    pub async fn get_entity_context(&self, entity_id: &str) -> Result<GraphEntity, sqlx::Error> {
        self.get_entity(entity_id).await
    }

    pub async fn get_related_entities(&self, entity_id: &str, relationship_types: Option<&[String]>, limit: i32) -> Result<Vec<GraphEntity>, sqlx::Error> {
        let mut query = r#"
            SELECT DISTINCT ge.* FROM graph_entities ge
            JOIN graph_relationships gr ON (ge.id = gr.source_id OR ge.id = gr.target_id)
            WHERE (gr.source_id = ? OR gr.target_id = ?)
            AND ge.id != ?
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![
            entity_id,
            entity_id,
            entity_id
        ];
        
        if let Some(types) = relationship_types {
            if !types.is_empty() {
                query.push_str(" AND gr.relationship_type IN (");
                query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        query.push_str(" ORDER BY gr.created_at DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut entities = Vec::new();
        for row in rows {
            entities.push(GraphEntity {
                id: row.get("id"),
                entity_type: row.get("entity_type"),
                name: row.get("name"),
                description: row.get("description"),
                metadata: row.get("metadata"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(entities)
    }
}
