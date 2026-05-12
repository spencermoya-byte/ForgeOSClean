use sqlx::{SqlitePool, Row};

pub async fn init_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create agents table
    let create_agents_table = r#"
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            capabilities TEXT,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_agents_table).execute(pool).await?;
    
    // Create workspace_members table
    let create_workspace_members_table = r#"
        CREATE TABLE IF NOT EXISTS workspace_members (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_workspace_members_table).execute(pool).await?;
    
    // Create activity_log table
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
        )
    "#;
    
    sqlx::query(create_activity_log_table).execute(pool).await?;
    
    // Create sync_metadata table
    let create_sync_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS sync_metadata (
            id TEXT PRIMARY KEY,
            resource_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            last_synced TEXT NOT NULL,
            sync_status TEXT NOT NULL,
            version INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_sync_metadata_table).execute(pool).await?;
    
    // Create presence table
    let create_presence_table = r#"
        CREATE TABLE IF NOT EXISTS presence (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            workspace_id TEXT,
            status TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_presence_table).execute(pool).await?;
    
    // Create client_contexts table
    let create_client_contexts_table = r#"
        CREATE TABLE IF NOT EXISTS client_contexts (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL UNIQUE,
            context_data TEXT NOT NULL,
            platform TEXT NOT NULL,
            client_type TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_client_contexts_table).execute(pool).await?;
    
    // Create client_health table
    let create_client_health_table = r#"
        CREATE TABLE IF NOT EXISTS client_health (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL UNIQUE,
            health_score REAL NOT NULL,
            status TEXT NOT NULL,
            platform_info TEXT NOT NULL,
            session_info TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_client_health_table).execute(pool).await?;
    
    // Create plugins table
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
        )
    "#;
    
    sqlx::query(create_plugins_table).execute(pool).await?;
    
    // Create plugin_settings table
    let create_plugin_settings_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_settings (
            id TEXT PRIMARY KEY,
            plugin_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_plugin_settings_table).execute(pool).await?;
    
    // Create plugin_capabilities table
    let create_plugin_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS plugin_capabilities (
            id TEXT PRIMARY KEY,
            plugin_id TEXT NOT NULL,
            capability TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_plugin_capabilities_table).execute(pool).await?;
    
    // Create workspaces table
    let create_workspaces_table = r#"
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            path TEXT NOT NULL,
            is_active INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_workspaces_table).execute(pool).await?;
    
    // Create projects table
    let create_projects_table = r#"
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_projects_table).execute(pool).await?;
    
    // Create resources table
    let create_resources_table = r#"
        CREATE TABLE IF NOT EXISTS resources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_resources_table).execute(pool).await?;
    
    // Create execution_requests table
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
        )
    "#;
    
    sqlx::query(create_execution_requests_table).execute(pool).await?;
    
    // Create execution_status table
    let create_execution_status_table = r#"
        CREATE TABLE IF NOT EXISTS execution_status (
            id TEXT PRIMARY KEY,
            execution_id TEXT NOT NULL,
            status TEXT NOT NULL,
            progress REAL NOT NULL,
            output TEXT NOT NULL,
            error TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_execution_status_table).execute(pool).await?;
    
    // Create tools table
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
        )
    "#;
    
    sqlx::query(create_tools_table).execute(pool).await?;
    
    // Create execution_history table
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
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_execution_history_table).execute(pool).await?;
    
    // Create sandbox_configurations table
    let create_sandbox_configurations_table = r#"
        CREATE TABLE IF NOT EXISTS sandbox_configurations (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            is_enabled INTEGER DEFAULT 1,
            allowed_commands TEXT NOT NULL,
            allowed_paths TEXT NOT NULL,
            max_memory INTEGER NOT NULL,
            max_cpu REAL NOT NULL,
            timeout INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_sandbox_configurations_table).execute(pool).await?;
    
    // Create telemetry_events table
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
        )
    "#;
    
    sqlx::query(create_telemetry_events_table).execute(pool).await?;
    
    // Create system_health_metrics table
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
        )
    "#;
    
    sqlx::query(create_system_health_metrics_table).execute(pool).await?;
    
    // Create subsystem_health table
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
        )
    "#;
    
    sqlx::query(create_subsystem_health_table).execute(pool).await?;
    
    // Create diagnostic_reports table
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
        )
    "#;
    
    sqlx::query(create_diagnostic_reports_table).execute(pool).await?;
    
    // Create health_aggregations table
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
        )
    "#;
    
    sqlx::query(create_health_aggregations_table).execute(pool).await?;
    
    // Create monitoring_configurations table
    let create_monitoring_configurations_table = r#"
        CREATE TABLE IF NOT EXISTS monitoring_configurations (
            id TEXT PRIMARY KEY,
            subsystem TEXT NOT NULL UNIQUE,
            is_enabled INTEGER DEFAULT 1,
            monitoring_level TEXT NOT NULL,
            alert_threshold REAL NOT NULL,
            alert_enabled INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_monitoring_configurations_table).execute(pool).await?;
    
    // Create workflows table
    let create_workflows_table = r#"
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            workspace_id TEXT,
            project_id TEXT,
            is_active INTEGER DEFAULT 1,
            trigger_type TEXT NOT NULL,
            trigger_config TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_workflows_table).execute(pool).await?;
    
    // Create workflow_steps table
    let create_workflow_steps_table = r#"
        CREATE TABLE IF NOT EXISTS workflow_steps (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            step_type TEXT NOT NULL,
            config TEXT NOT NULL,
            position INTEGER NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_workflow_steps_table).execute(pool).await?;
    
    // Create workflow_executions table
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
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_workflow_executions_table).execute(pool).await?;
    
    // Create indexed_files table
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
        )
    "#;
    
    sqlx::query(create_indexed_files_table).execute(pool).await?;
    
    // Create project_metadata table
    let create_project_metadata_table = r#"
        CREATE TABLE IF NOT EXISTS project_metadata (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            file_count INTEGER NOT NULL,
            total_size INTEGER NOT NULL,
            last_indexed TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_project_metadata_table).execute(pool).await?;
    
    // Create file_relationships table
    let create_file_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS file_relationships (
            id TEXT PRIMARY KEY,
            source_file_id TEXT NOT NULL,
            target_file_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_file_relationships_table).execute(pool).await?;
    
    // Create indexing_status table
    let create_indexing_status_table = r#"
        CREATE TABLE IF NOT EXISTS indexing_status (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            project_id TEXT,
            status TEXT NOT NULL,
            progress REAL NOT NULL,
            total_files INTEGER NOT NULL,
            processed_files INTEGER NOT NULL,
            last_updated TEXT NOT NULL,
            error_message TEXT
        )
    "#;
    
    sqlx::query(create_indexing_status_table).execute(pool).await?;
    
    // Create code_symbols table
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
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_code_symbols_table).execute(pool).await?;
    
    // Create code_relationships table
    let create_code_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS code_relationships (
            id TEXT PRIMARY KEY,
            source_symbol_id TEXT NOT NULL,
            target_symbol_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_code_relationships_table).execute(pool).await?;
    
    // Create code_analysis table
    let create_code_analysis_table = r#"
        CREATE TABLE IF NOT EXISTS code_analysis (
            id TEXT PRIMARY KEY,
            file_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            analysis_type TEXT NOT NULL,
            result TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_code_analysis_table).execute(pool).await?;
    
    // Create project_code_intelligence table
    let create_project_code_intelligence_table = r#"
        CREATE TABLE IF NOT EXISTS project_code_intelligence (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            symbol_count INTEGER NOT NULL,
            file_count INTEGER NOT NULL,
            average_complexity REAL NOT NULL,
            last_analyzed TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_project_code_intelligence_table).execute(pool).await?;
    
    // Create graph_entities table
    let create_graph_entities_table = r#"
        CREATE TABLE IF NOT EXISTS graph_entities (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_graph_entities_table).execute(pool).await?;
    
    // Create graph_relationships table
    let create_graph_relationships_table = r#"
        CREATE TABLE IF NOT EXISTS graph_relationships (
            id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL NOT NULL,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_graph_relationships_table).execute(pool).await?;
    
    // Create embeddings table
    let create_embeddings_table = r#"
        CREATE TABLE IF NOT EXISTS embeddings (
            id TEXT PRIMARY KEY,
            entity_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            embedding TEXT NOT NULL,
            metadata TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_embeddings_table).execute(pool).await?;
    
    // Create knowledge_graph_nodes table
    let create_knowledge_graph_nodes_table = r#"
        CREATE TABLE IF NOT EXISTS knowledge_graph_nodes (
            id TEXT PRIMARY KEY,
            node_type TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_knowledge_graph_nodes_table).execute(pool).await?;
    
    // Create knowledge_graph_edges table
    let create_knowledge_graph_edges_table = r#"
        CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
            id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            weight REAL NOT NULL,
            metadata TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_knowledge_graph_edges_table).execute(pool).await?;
    
    // Create extensions table
    let create_extensions_table = r#"
        CREATE TABLE IF NOT EXISTS extensions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            description TEXT,
            author TEXT NOT NULL,
            author_id TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            is_system INTEGER DEFAULT 0,
            is_verified INTEGER DEFAULT 0,
            rating REAL DEFAULT 0.0,
            download_count INTEGER DEFAULT 0,
            size INTEGER DEFAULT 0,
            dependencies TEXT NOT NULL,
            capabilities TEXT NOT NULL,
            license TEXT NOT NULL,
            homepage TEXT NOT NULL,
            repository TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            metadata TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_extensions_table).execute(pool).await?;
    
    // Create capabilities table
    let create_capabilities_table = r#"
        CREATE TABLE IF NOT EXISTS capabilities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            version TEXT NOT NULL,
            provider TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            is_system INTEGER DEFAULT 0,
            dependencies TEXT NOT NULL,
            capabilities TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            metadata TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_capabilities_table).execute(pool).await?;
    
    // Create engineering_assets table
    let create_engineering_assets_table = r#"
        CREATE TABLE IF NOT EXISTS engineering_assets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            asset_type TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT NOT NULL,
            author TEXT NOT NULL,
            author_id TEXT NOT NULL,
            is_public INTEGER DEFAULT 1,
            is_verified INTEGER DEFAULT 0,
            rating REAL DEFAULT 0.0,
            download_count INTEGER DEFAULT 0,
            size INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            content TEXT NOT NULL,
            metadata TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_engineering_assets_table).execute(pool).await?;
    
    // Create extension_installations table
    let create_extension_installations_table = r#"
        CREATE TABLE IF NOT EXISTS extension_installations (
            id TEXT PRIMARY KEY,
            extension_id TEXT NOT NULL,
            version TEXT NOT NULL,
            status TEXT NOT NULL,
            installed_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_extension_installations_table).execute(pool).await?;
    
    // Create asset_downloads table
    let create_asset_downloads_table = r#"
        CREATE TABLE IF NOT EXISTS asset_downloads (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            version TEXT NOT NULL,
            status TEXT NOT NULL,
            downloaded_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    "#;
    
    sqlx::query(create_asset_downloads_table).execute(pool).await?;
    
    Ok(())
}
