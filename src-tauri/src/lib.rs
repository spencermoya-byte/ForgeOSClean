mod commands;
mod services;
mod state;
mod utils;

use tauri::{Builder, Context};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::get_system_info,
            commands::get_workspace_path
        ])
        .run(Context::default())
        .expect("error while running tauri application");
}
