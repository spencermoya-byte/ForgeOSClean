use sqlx::{SqlitePool, Row};
use std::path::Path;

pub async fn init_database() -> Result<SqlitePool, sqlx::Error> {
    // Create the database directory if it doesn't exist
    let db_path = "sqlite.db";
    
    // Create the connection pool
    let pool = SqlitePool::connect(&format!("sqlite:{}", db_path)).await?;
    
    // Initialize the database schema
    init_schema(&pool).await?;
    
    Ok(pool)
}

async fn init_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create workspaces table
    let create_workspaces_table = r#"
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            path TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_workspaces_table).execute(pool).await?;
    
    // Create projects table
    let create_projects_table = r#"
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            workspace_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_projects_table).execute(pool).await?;
    
    // Create resources table with workspace and project references
    let create_resources_table = r#"
        CREATE TABLE IF NOT EXISTS resources (
            id TEXT PRIMARY KEY,
            workspace_id TEXT,
            project_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            tags TEXT,
            status TEXT DEFAULT 'active',
            is_pinned INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_resources_table).execute(pool).await?;
    
    // Create categories table
    let create_categories_table = r#"
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_categories_table).execute(pool).await?;
    
    // Create tags table
    let create_tags_table = r#"
        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            created_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_tags_table).execute(pool).await?;
    
    // Create resource_tags junction table for many-to-many relationship
    let create_resource_tags_table = r#"
        CREATE TABLE IF NOT EXISTS resource_tags (
            resource_id TEXT,
            tag_id TEXT,
            PRIMARY KEY (resource_id, tag_id),
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_resource_tags_table).execute(pool).await?;
    
    // Create AI models table
    let create_ai_models_table = r#"
        CREATE TABLE IF NOT EXISTS ai_models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_ai_models_table).execute(pool).await?;
    
    // Create AI providers table
    let create_ai_providers_table = r#"
        CREATE TABLE IF NOT EXISTS ai_providers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            base_url TEXT,
            api_key TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_ai_providers_table).execute(pool).await?;
    
    // Create AI chat sessions table
    let create_ai_chat_sessions_table = r#"
        CREATE TABLE IF NOT EXISTS ai_chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_ai_chat_sessions_table).execute(pool).await?;
    
    // Create AI chat messages table
    let create_ai_chat_messages_table = r#"
        CREATE TABLE IF NOT EXISTS ai_chat_messages (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            model_id TEXT,
            provider_id TEXT,
            FOREIGN KEY (session_id) REFERENCES ai_chat_sessions (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_ai_chat_messages_table).execute(pool).await?;
    
    Ok(())
}
