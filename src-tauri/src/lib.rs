mod commands;
mod services;
mod state;
mod utils;
mod database;
mod ai;

use tauri::Manager;
use database::init::init_database;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::get_system_info,
            commands::get_workspace_path,
            commands::auth::login,
            commands::auth::register,
            commands::auth::logout,
            commands::auth::get_user_info,
            commands::auth::get_user_profile,
            commands::auth::update_user_profile,
            commands::auth::update_user_password,
            commands::resource::create_resource,
            commands::resource::get_resources,
            commands::resource::get_resource,
            commands::resource::update_resource,
            commands::resource::delete_resource,
            commands::workspace::create_workspace,
            commands::workspace::get_workspaces,
            commands::workspace::get_workspace,
            commands::workspace::update_workspace,
            commands::workspace::delete_workspace,
            commands::workspace::set_active_workspace,
            commands::workspace::get_active_workspace,
            commands::workspace::get_workspace_members,
            commands::workspace::add_workspace_member,
            commands::workspace::update_workspace_member,
            commands::workspace::remove_workspace_member,
            commands::project::create_project,
            commands::project::get_projects,
            commands::project::get_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::set_active_project,
            commands::project::get_active_project,
            commands::ai::get_ai_models,
            commands::ai::get_ai_providers,
            commands::ai::get_ai_model_status,
            commands::ai::get_ai_provider_status,
            commands::ai::send_ai_request,
            commands::ai::create_ai_chat_session,
            commands::ai::send_ai_chat_message,
            commands::ai::get_ai_chat_history,
            commands::ai::generate_embedding,
            commands::ai::vector_search,
            commands::ai::generate_workflow_suggestions,
            commands::ai::get_workflow_context,
            commands::ai::get_agents,
            commands::ai::get_agent,
            commands::ai::create_agent,
            commands::ai::update_agent,
            commands::ai::delete_agent,
            commands::ai::get_agent_capabilities,
            commands::ai::execute_agent_task,
            commands::ai::search_graph,
            commands::ai::traverse_graph,
            commands::ai::update_graph,
            commands::workflow::create_workflow,
            commands::workflow::get_workflows,
            commands::workflow::get_workflow,
            commands::workflow::update_workflow,
            commands::workflow::delete_workflow,
            commands::workflow::create_workflow_step,
            commands::workflow::get_workflow_steps,
            commands::workflow::update_workflow_step,
            commands::workflow::create_workflow_execution,
            commands::workflow::get_workflow_executions,
            commands::plugin::get_plugins,
            commands::plugin::get_plugin,
            commands::plugin::create_plugin,
            commands::plugin::update_plugin,
            commands::plugin::delete_plugin,
            commands::plugin::get_plugin_settings,
            commands::plugin::get_plugin_setting,
            commands::plugin::update_plugin_setting,
            commands::plugin::get_plugin_capabilities,
            commands::plugin::update_plugin_capability,
            commands::ai::plugin::get_plugin_context,
            commands::ai::plugin::update_plugin_capability,
            commands::ai::plugin::update_plugin_setting,
            commands::sync::get_sync_status,
            commands::sync::queue_sync_request,
            commands::sync::get_sync_history,
            commands::sync::get_device_info,
            commands::sync::update_device_info,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                app.handle().plugin(tauri_plugin_devtools::init())?;
            }
            
            // Initialize database
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                match init_database().await {
                    Ok(pool) => {
                        handle.manage(pool);
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
