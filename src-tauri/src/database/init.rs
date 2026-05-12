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
    
    // Create graph entities table
    let create_graph_entities_table = r#"
        CREATE TABLE IF NOT EXISTS graph_entities (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_graph_entities_table).execute(pool).await?;
    
    // Create graph relationships table
    let create_graph_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS graph_relationships (
            id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL DEFAULT 1.0,
            metadata TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (source_id) REFERENCES graph_entities (id) ON DELETE CASCADE,
            FOREIGN KEY (target_id) REFERENCES graph_entities (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_graph_relationships_table).execute(pool).await?;
    
    // Create contextual metadata table
    let create_contextual_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS contextual_metadata (
            id TEXT PRIMARY KEY,
            entity_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES graph_entities (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_contextual_metadata_table).execute(pool).await?;
    
    // Create workflow tables (existing)
    let create_workflows_table = r#"
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            workspace_id TEXT,
            project_id TEXT,
            is_active INTEGER DEFAULT 1,
            trigger_type TEXT NOT NULL,
            trigger_config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_workflows_table).execute(pool).await?;
    
    let create_workflow_steps_table = r#"
        CREATE TABLE IF NOT EXISTS workflow_steps (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            step_type TEXT NOT NULL,
            config TEXT,
            position INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_workflow_steps_table).execute(pool).await?;
    
    let create_workflow_executions_table = r#"
        CREATE TABLE IF NOT EXISTS workflow_executions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
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
    
    // Create plugin tables (existing)
    let create_plugins_table = r#"
        CREATE TABLE IF NOT EXISTS plugins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            description TEXT,
            author TEXT,
            is_active INTEGER DEFAULT 1,
            is_system INTEGER DEFAULT 0,
            capabilities TEXT,
            config TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_plugins_table).execute(pool).await?;
    
    let create_plugin_settings_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_settings (
            id TEXT PRIMARY KEY,
            plugin_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_plugin_settings_table).execute(pool).await?;
    
    let create_plugin_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_capabilities (
            id TEXT PRIMARY KEY,
            plugin_id TEXT NOT NULL,
            capability TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_plugin_capabilities_table).execute(pool).await?;
    
    // Create resource tables (existing)
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
    
    // Create workspace tables (existing)
    let create_workspaces_table = r#"
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            path TEXT NOT NULL,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_workspaces_table).execute(pool).await?;
    
    // Create project tables (existing)
    let create_projects_table = r#"
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_projects_table).execute(pool).await?;
    
    // Create collaboration tables (existing)
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
    
    let create_activity_log_table = r#"
        CREATE TABLE IF NOT EXISTS activity_log (
            id TEXT PRIMARY KEY,
            workspace_id TEXT,
            project_id TEXT,
            resource_id TEXT,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            created_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_activity_log_table).execute(pool).await?;
    
    // Create sync tables (existing)
    let create_sync_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS sync_metadata (
            id TEXT PRIMARY KEY,
            resource_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            last_synced TEXT NOT NULL,
            sync_status TEXT NOT NULL,
            version INTEGER DEFAULT 1,
            remote_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_sync_metadata_table).execute(pool).await?;
    
    let create_sync_queue_table = r#"
        CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            resource_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT NOT NULL,
            priority INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_sync_queue_table).execute(pool).await?;
    
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
    
    // Create embedding tables (existing)
    let create_embeddings_table = r#"
        CREATE TABLE IF NOT EXISTS embeddings (
            id TEXT PRIMARY KEY,
            resource_id TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_embeddings_table).execute(pool).await?;
    
    // Create filesystem tables
    let create_indexed_files_table = r#"
        CREATE TABLE IF NOT EXISTS indexed_files (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            path TEXT NOT NULL,
            name TEXT NOT NULL,
            size INTEGER NOT NULL,
            file_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL,
            metadata TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_indexed_files_table).execute(pool).await?;
    
    let create_project_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS project_metadata (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            file_count INTEGER NOT NULL,
            total_size INTEGER NOT NULL,
            last_indexed TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_project_metadata_table).execute(pool).await?;
    
    let create_file_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS file_relationships (
            id TEXT PRIMARY KEY,
            source_file_id TEXT NOT NULL,
            target_file_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL DEFAULT 1.0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (source_file_id) REFERENCES indexed_files (id) ON DELETE CASCADE,
            FOREIGN KEY (target_file_id) REFERENCES indexed_files (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_file_relationships_table).execute(pool).await?;
    
    let create_indexing_status_table = r#"
        CREATE TABLE IF NOT EXISTS indexing_status (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            status TEXT NOT NULL,
            progress REAL DEFAULT 0.0,
            total_files INTEGER DEFAULT 0,
            processed_files INTEGER DEFAULT 0,
            last_updated TEXT NOT NULL,
            error_message TEXT
        );
    "#;
    
    sqlx::execute(create_indexing_status_table).execute(pool).await?;
    
    // Create code intelligence tables
    let create_code_symbols_table = r#"
        CREATE TABLE IF NOT EXISTS code_symbols (
            id TEXT PRIMARY KEY,
            file_id TEXT NOT NULL,
            name TEXT NOT NULL,
            symbol_type TEXT NOT NULL,
            start_line INTEGER NOT NULL,
            end_line INTEGER NOT NULL,
            signature TEXT NOT NULL,
            documentation TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (file_id) REFERENCES indexed_files (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_code_symbols_table).execute(pool).await?;
    
    let create_code_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS code_relationships (
            id TEXT PRIMARY KEY,
            source_symbol_id TEXT NOT NULL,
            target_symbol_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL DEFAULT 1.0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (source_symbol_id) REFERENCES code_symbols (id) ON DELETE CASCADE,
            FOREIGN KEY (target_symbol_id) REFERENCES code_symbols (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_code_relationships_table).execute(pool).await?;
    
    let create_code_analysis_table = r#"
        CREATE TABLE IF NOT EXISTS code_analysis (
            id TEXT PRIMARY KEY,
            file_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            analysis_type TEXT NOT NULL,
            result TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (file_id) REFERENCES indexed_files (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_code_analysis_table).execute(pool).await?;
    
    let create_project_code_intelligence_table = r#"
        CREATE TABLE IF NOT EXISTS project_code_intelligence (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            symbol_count INTEGER NOT NULL,
            file_count INTEGER NOT NULL,
            average_complexity REAL DEFAULT 0.0,
            last_analyzed TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_project_code_intelligence_table).execute(pool).await?;
    
    // Create execution tables
    let create_execution_requests_table = r#"
        CREATE TABLE IF NOT EXISTS execution_requests (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            tool_id TEXT NOT NULL,
            command TEXT NOT NULL,
            arguments TEXT NOT NULL,
            working_directory TEXT NOT NULL,
            environment TEXT NOT NULL,
            timeout INTEGER NOT NULL,
            is_sandboxed INTEGER DEFAULT 1,
            is_restricted INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_execution_requests_table).execute(pool).await?;
    
    let create_execution_status_table = r#"
        CREATE TABLE IF NOT EXISTS execution_status (
            id TEXT PRIMARY KEY,
            execution_id TEXT NOT NULL,
            status TEXT NOT NULL,
            progress REAL DEFAULT 0.0,
            output TEXT NOT NULL,
            error TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (execution_id) REFERENCES execution_requests (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_execution_status_table).execute(pool).await?;
    
    let create_tools_table = r#"
        CREATE TABLE IF NOT EXISTS tools (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            version TEXT NOT NULL,
            executable TEXT NOT NULL,
            arguments TEXT NOT NULL,
            capabilities TEXT NOT NULL,
            is_system INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_tools_table).execute(pool).await?;
    
    let create_execution_history_table = r#"
        CREATE TABLE IF NOT EXISTS execution_history (
            id TEXT PRIMARY KEY,
            execution_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            tool_id TEXT NOT NULL,
            command TEXT NOT NULL,
            status TEXT NOT NULL,
            exit_code INTEGER,
            duration INTEGER,
            started_at TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (execution_id) REFERENCES execution_requests (id) ON DELETE CASCADE
        );
    "#;
    
    sqlx::execute(create_execution_history_table).execute(pool).await?;
    
    let create_sandbox_configurations_table = r#"
        CREATE TABLE IF NOT EXISTS sandbox_configurations (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            is_enabled INTEGER DEFAULT 1,
            allowed_commands TEXT NOT NULL,
            allowed_paths TEXT NOT NULL,
            max_memory INTEGER NOT NULL,
            max_cpu REAL DEFAULT 1.0,
            timeout INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_sandbox_configurations_table).execute(pool).await?;
    
    // Create observability tables
    let create_telemetry_events_table = r#"
        CREATE TABLE IF NOT EXISTS telemetry_events (
            id TEXT PRIMARY KEY,
            event_type TEXT NOT NULL,
            source TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            workspace_id TEXT,
            project_id TEXT,
            user_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_telemetry_events_table).execute(pool).await?;
    
    let create_system_health_metrics_table = r#"
        CREATE TABLE IF NOT EXISTS system_health_metrics (
            id TEXT PRIMARY KEY,
            metric_type TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            workspace_id TEXT,
            project_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_system_health_metrics_table).execute(pool).await?;
    
    let create_subsystem_health_table = r#"
        CREATE TABLE IF NOT EXISTS subsystem_health (
            id TEXT PRIMARY KEY,
            subsystem TEXT NOT NULL,
            status TEXT NOT NULL,
            health_score REAL NOT NULL,
            last_updated TEXT NOT NULL,
            workspace_id TEXT,
            project_id TEXT,
            details TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_subsystem_health_table).execute(pool).await?;
    
    let create_diagnostic_reports_table = r#"
        CREATE TABLE IF NOT EXISTS diagnostic_reports (
            id TEXT PRIMARY KEY,
            report_type TEXT NOT NULL,
            source TEXT NOT NULL,
            status TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            workspace_id TEXT,
            project_id TEXT,
            user_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_diagnostic_reports_table).execute(pool).await?;
    
    let create_health_aggregations_table = r#"
        CREATE TABLE IF NOT EXISTS health_aggregations (
            id TEXT PRIMARY KEY,
            aggregation_type TEXT NOT NULL,
            period TEXT NOT NULL,
            metrics TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            workspace_id TEXT,
            project_id TEXT,
            user_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_health_aggregations_table).execute(pool).await?;
    
    let create_monitoring_configurations_table = r#"
        CREATE TABLE IF NOT EXISTS monitoring_configurations (
            id TEXT PRIMARY KEY,
            subsystem TEXT NOT NULL UNIQUE,
            is_enabled INTEGER DEFAULT 1,
            monitoring_level TEXT NOT NULL,
            alert_threshold REAL DEFAULT 0.0,
            alert_enabled INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    "#;
    
    sqlx::execute(create_monitoring_configurations_table).execute(pool).await?;
    
    Ok(())
}
