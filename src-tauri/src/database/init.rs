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
    // ... [existing schema code] ...
    
    // Create agents table
    let create_agents_table = r#"
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            capabilities TEXT,
            is_active INTEGER DEFAULT 0,
            config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_agents_table).execute(pool).await?;
    
    // Create agent capabilities table
    let create_agent_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS agent_capabilities (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            capability TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_agent_capabilities_table).execute(pool).await?;
    
    // Create agent executions table
    let create_agent_executions_table = r#"
        CREATE TABLE IF NOT EXISTS agent_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            task_id TEXT,
            status TEXT NOT NULL,
            result TEXT,
            error_message TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES agent_tasks (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_agent_executions_table).execute(pool).await?;
    
    // Create agent tasks table
    let create_agent_tasks_table = r#"
        CREATE TABLE IF NOT EXISTS agent_tasks (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            context TEXT,
            priority INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_agent_tasks_table).execute(pool).await?;
    
    // ... [rest of existing schema code] ...
    
    Ok(())
}
