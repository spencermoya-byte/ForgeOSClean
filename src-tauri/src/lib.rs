use tauri::Manager;
use crate::state::app_config::AppConfig;
use crate::state::workspace::WorkspaceState;
use crate::state::runtime_metadata::RuntimeMetadata;
use crate::state::client::ClientContext;
use crate::state::marketplace::MarketplaceState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::get_system_info,
            commands::get_workspace_path,
            commands::auth::login,
            commands::auth::register,
            commands::auth::logout,
            commands::builder_execution::vivus_execution_preview,
            commands::builder_terminal::vivus_run_safe_command,
            commands::builder_files::vivus_list_project_tree,
            commands::builder_files::vivus_read_project_file,
            commands::builder_patches::vivus_preview_file_patch,
            commands::builder_patches::vivus_create_patch_checkpoint,
            commands::builder_patches::vivus_apply_approved_file_patch,
            commands::builder_patches::vivus_restore_patch_checkpoint,
            commands::builder_ollama::vivus_ollama_status,
            commands::builder_ollama::vivus_ollama_generate,
            commands::filesystem::start_filesystem_indexing,
            commands::filesystem::search_filesystem,
            commands::filesystem::get_filesystem_context,
            commands::filesystem::get_filesystem_indexing_status,
            commands::filesystem::index_code_symbols,
            commands::filesystem::analyze_code,
            commands::filesystem::get_project_code_intelligence,
            commands::execution::submit_execution_request,
            commands::execution::get_execution_status,
            commands::execution::get_tool_definitions,
            commands::execution::get_execution_history,
            commands::execution::get_sandbox_configuration,
            commands::execution::update_sandbox_configuration,
