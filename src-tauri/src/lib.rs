mod commands;
mod services;
mod state;
mod utils;

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
            commands::profile::get_user_profile,
            commands::profile::update_user_profile,
            commands::profile::update_user_password,
        ])
        .run(Context::default())
        .expect("error while running tauri application");
}
