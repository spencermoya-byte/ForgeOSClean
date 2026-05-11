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
