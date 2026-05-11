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
    let create_resources_table = r#"
        CREATE TABLE IF NOT EXISTS resources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_resources_table).execute(pool).await?;
    
    Ok(())
}
