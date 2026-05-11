use tauri::Manager;

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    let window = tauri::WindowBuilder::new(tauri::AppHandle::default(), "main", Default::default())
        .build()
        .unwrap();
    let app_handle = window.app_handle();

    serde_json::json!({
        "os": app_handle.env().os_release(),
        "arch": app_handle.env().arch(),
        "path_separator": std::path::MAIN_SEPARATOR
    })
}
