mod commands;

pub fn run() {
    tauri::Builder::default()
        .manage(commands::builder_terminal::PreviewServerState::default())
        .invoke_handler(tauri::generate_handler![
            commands::builder_execution::vivus_execution_preview,
            commands::builder_terminal::vivus_run_safe_command,
            commands::builder_terminal::vivus_start_dev_server,
            commands::builder_terminal::vivus_stop_dev_server,
            commands::builder_terminal::vivus_dev_server_status,
            commands::builder_files::vivus_list_project_tree,
            commands::builder_files::vivus_read_project_file,
            commands::builder_files::vivus_write_project_file,
            commands::builder_patches::vivus_preview_file_patch,
            commands::builder_patches::vivus_create_patch_checkpoint,
            commands::builder_patches::vivus_apply_approved_file_patch,
            commands::builder_patches::vivus_restore_patch_checkpoint,
            commands::builder_ollama::vivus_ollama_status,
            commands::builder_ollama::vivus_ollama_generate,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Vivus");
}
