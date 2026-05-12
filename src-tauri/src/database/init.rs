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
    
    // Create vector embeddings table
    let create_embeddings_table = r#"
        CREATE TABLE IF NOT EXISTS embeddings (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            content TEXT NOT NULL,
            embedding BLOB NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_embeddings_table).execute(pool).await?;
    
    // Create embedding metadata table
    let create_embedding_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS embedding_metadata (
            id TEXT PRIMARY KEY,
            embedding_id TEXT,
            workspace_id TEXT,
            project_id TEXT,
            resource_id TEXT,
            chunk_index INTEGER,
            chunk_size INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY (embedding_id) REFERENCES embeddings (id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_embedding_metadata_table).execute(pool).await?;
    
    // Create indexing queue table
    let create_indexing_queue_table = r#"
        CREATE TABLE IF NOT EXISTS indexing_queue (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            workspace_id TEXT,
            project_id TEXT,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_indexing_queue_table).execute(pool).await?;
    
    // Create workflows table
    let create_workflows_table = r#"
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            workspace_id TEXT,
            project_id TEXT,
            is_active INTEGER DEFAULT 0,
            trigger_type TEXT,
            trigger_config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_workflows_table).execute(pool).await?;
    
    // Create workflow steps table
    let create_workflow_steps_table = r#"
        CREATE TABLE IF NOT EXISTS workflow_steps (
            id TEXT PRIMARY KEY,
            workflow_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            step_type TEXT NOT NULL,
            config TEXT,
            position INTEGER,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_workflow_steps_table).execute(pool).await?;
    
    // Create workflow execution history table
    let create_workflow_executions_table = r#"
        CREATE TABLE IF NOT EXISTS workflow_executions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT,
            status TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            error_message TEXT,
            result TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_workflow_executions_table).execute(pool).await?;
    
    // Create automation table
    let create_automations_table = r#"
        CREATE TABLE IF NOT EXISTS automations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            workspace_id TEXT,
            project_id TEXT,
            is_active INTEGER DEFAULT 0,
            trigger_type TEXT,
            trigger_config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_automations_table).execute(pool).await?;
    
    // Create automation steps table
    let create_automation_steps_table = r#"
        CREATE TABLE IF NOT EXISTS automation_steps (
            id TEXT PRIMARY KEY,
            automation_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            step_type TEXT NOT NULL,
            config TEXT,
            position INTEGER,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (automation_id) REFERENCES automations (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_automation_steps_table).execute(pool).await?;
    
    // Create automation execution history table
    let create_automation_executions_table = r#"
        CREATE TABLE IF NOT EXISTS automation_executions (
            id TEXT PRIMARY KEY,
            automation_id TEXT,
            status TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            error_message TEXT,
            result TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (automation_id) REFERENCES automations (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_automation_executions_table).execute(pool).await?;
    
    // Create plugins table
    let create_plugins_table = r#"
        CREATE TABLE IF NOT EXISTS plugins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            description TEXT,
            author TEXT,
            is_active INTEGER DEFAULT 0,
            is_system INTEGER DEFAULT 0,
            capabilities TEXT,
            config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_plugins_table).execute(pool).await?;
    
    // Create plugin settings table
    let create_plugin_settings_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_settings (
            id TEXT PRIMARY KEY,
            plugin_id TEXT,
            key TEXT NOT NULL,
            value TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_plugin_settings_table).execute(pool).await?;
    
    // Create plugin capabilities table
    let create_plugin_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_capabilities (
            id TEXT PRIMARY KEY,
            plugin_id TEXT,
            capability TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_plugin_capabilities_table).execute(pool).await?;
    
    // Create collaboration tables
    let create_workspace_members_table = r#"
        CREATE TABLE IF NOT EXISTS workspace_members (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_workspace_members_table).execute(pool).await?;
    
    // Create activity log table
    let create_activity_log_table = r#"
        CREATE TABLE IF NOT EXISTS activity_log (
            id TEXT PRIMARY KEY,
            workspace_id TEXT,
            project_id TEXT,
            resource_id TEXT,
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_activity_log_table).execute(pool).await?;
    
    // Create synchronization metadata table
    let create_sync_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS sync_metadata (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            workspace_id TEXT,
            project_id TEXT,
            last_synced TEXT,
            sync_status TEXT DEFAULT 'synced',
            version INTEGER DEFAULT 1,
            remote_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_sync_metadata_table).execute(pool).await?;
    
    // Create presence table for real-time status
    let create_presence_table = r#"
        CREATE TABLE IF NOT EXISTS presence (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            workspace_id TEXT,
            status TEXT DEFAULT 'offline',
            last_seen TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_presence_table).execute(pool).await?;
    
    // Create sync queue table
    let create_sync_queue_table = r#"
        CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            workspace_id TEXT,
            project_id TEXT,
            operation TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_sync_queue_table).execute(pool).await?;
    
    // Create devices table
    let create_devices_table = r#"
        CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            device_name TEXT NOT NULL,
            device_type TEXT NOT NULL,
            platform TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_devices_table).execute(pool).await?;
    
    // Create sync history table
    let create_sync_history_table = r#"
        CREATE TABLE IF NOT EXISTS sync_history (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            workspace_id TEXT,
            project_id TEXT,
            operation TEXT NOT NULL,
            status TEXT NOT NULL,
            sync_time TEXT NOT NULL,
            version INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_sync_history_table).execute(pool).await?;
    
    Ok(())
}
