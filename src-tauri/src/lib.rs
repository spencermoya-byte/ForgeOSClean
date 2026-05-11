mod commands;
mod services;
mod state;
mod utils;

use tauri::Manager;

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
        ])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                app.handle().plugin(tauri_plugin_devtools::init())?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
