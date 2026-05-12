use tauri::Manager;
use crate::state::app_config::AppConfig;
use crate::state::workspace::WorkspaceState;
use crate::state::runtime_metadata::RuntimeMetadata;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Commands from different modules
            commands::get_app_info,
            commands::get_system_info,
            commands::get_workspace_path,
            commands::auth::login,
            commands::auth::register,
            commands::auth::logout,
            
            // Filesystem commands
            commands::filesystem::start_filesystem_indexing,
            commands::filesystem::search_filesystem,
            commands::filesystem::get_filesystem_context,
            commands::filesystem::get_filesystem_indexing_status,
            commands::filesystem::index_code_symbols,
            commands::filesystem::analyze_code,
            commands::filesystem::get_project_code_intelligence,
            
            // Execution commands
            commands::execution::submit_execution_request,
            commands::execution::get_execution_status,
            commands::execution::get_tool_definitions,
            commands::execution::get_execution_history,
            commands::execution::get_sandbox_configuration,
            commands::execution::update_sandbox_configuration,
            
            // Observability commands
            commands::observability::log_telemetry_event,
            commands::observability::get_system_health_metrics,
            commands::observability::get_subsystem_health,
            commands::observability::get_telemetry_events,
            commands::observability::get_diagnostic_reports,
            commands::observability::get_health_aggregations,
            commands::observability::get_monitoring_configuration,
            commands::observability::update_monitoring_configuration,
            
            // Project commands
            commands::project::get_projects,
            commands::project::get_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::set_active_project,
            commands::project::get_active_project,
            
            // Resource commands
            commands::resource::create_resource,
            commands::resource::get_resource,
            commands::resource::update_resource,
            commands::resource::delete_resource,
            
            // Workspace commands
            commands::workspace::get_workspace,
            
            // AI commands
            ai::filesystem::start_filesystem_indexing,
            ai::filesystem::search_filesystem,
            ai::filesystem::get_filesystem_context,
            ai::filesystem::get_filesystem_indexing_status,
            ai::filesystem::index_code_symbols,
            ai::filesystem::analyze_code,
            ai::filesystem::get_project_code_intelligence,
            
            // Workflow commands
            ai::workflow::generate_workflow_suggestions,
            ai::workflow::get_workflow_context,
            
            // Agent commands
            ai::agent::get_ai_models,
            ai::agent::get_ai_providers,
            ai::agent::get_ai_model_status,
            ai::agent::get_ai_provider_status,
            ai::agent::send_ai_request,
            ai::agent::create_ai_chat_session,
            ai::agent::send_ai_chat_message,
            ai::agent::get_ai_chat_history,
            
            // Knowledge graph commands
            ai::knowledge_graph::get_graph_entities,
            ai::knowledge_graph::get_graph_relationships,
            ai::knowledge_graph::create_graph_entity,
            ai::knowledge_graph::create_graph_relationship,
            ai::knowledge_graph::update_graph_entity,
            ai::knowledge_graph::delete_graph_entity,
            ai::knowledge_graph::get_contextual_metadata,
            ai::knowledge_graph::set_contextual_metadata,
            
            // Semantic search commands
            ai::semantic_search::search_semantic,
            ai::semantic_search::create_embedding,
            ai::semantic_search::get_embeddings,
            
            // Plugin commands
            ai::plugin::get_plugins,
            ai::plugin::get_plugin,
            ai::plugin::create_plugin,
            ai::plugin::update_plugin,
            ai::plugin::delete_plugin,
            ai::plugin::enable_plugin,
            ai::plugin::disable_plugin,
            ai::plugin::get_plugin_capabilities,
            ai::plugin::set_plugin_capability,
            
            // Collaboration commands
            ai::collaboration::log_activity,
            ai::collaboration::get_activity_log,
            
            // Sync commands
            ai::sync::get_sync_metadata,
            ai::sync::update_sync_metadata,
            ai::sync::get_sync_queue,
            ai::sync::add_to_sync_queue,
            ai::sync::process_sync_queue,
            ai::sync::get_device_info,
            ai::sync::register_device,
            
            // Embedding commands
            ai::embedding::create_embedding,
            ai::embedding::get_embeddings,
            ai::embedding::search_embeddings,
            
            // Code intelligence commands
            ai::code_intelligence::get_code_symbols,
            ai::code_intelligence::get_code_relationships,
            ai::code_intelligence::get_code_analysis,
            ai::code_intelligence::get_project_intelligence,
            
            // Execution commands
            ai::execution::submit_execution_request,
            ai::execution::get_execution_status,
            ai::execution::get_tool_definitions,
            ai::execution::get_execution_history,
            ai::execution::get_sandbox_configuration,
            ai::execution::update_sandbox_configuration,
            
            // Observability commands
            ai::observability::log_telemetry_event,
            ai::observability::get_system_health_metrics,
            ai::observability::get_subsystem_health,
            ai::observability::get_telemetry_events,
            ai::observability::get_diagnostic_reports,
            ai::observability::get_health_aggregations,
            ai::observability::get_monitoring_configuration,
            ai::observability::update_monitoring_configuration,
        ])
        .setup(|app| {
            // Initialize app state
            let app_config = AppConfig::default();
            let workspace_state = WorkspaceState::default();
            let runtime_metadata = RuntimeMetadata::default();
            
            app.manage(app_config);
            app.manage(workspace_state);
            app.manage(runtime_metadata);
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
