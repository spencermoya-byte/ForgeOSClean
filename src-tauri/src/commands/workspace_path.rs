use tauri::Manager;

#[tauri::command]
fn get_workspace_path() -> serde_json::Value {
    let window = tauri::WindowBuilder::new(tauri::AppHandle::default(), "main", Default::default())
        .build()
        .unwrap();
    let app_handle = window.app_handle();

    serde_json::json!({
        "workspace_path": app_handle.path_resolver().app_data_dir("ForgeOS").unwrap().to_string_lossy()
    })
}
