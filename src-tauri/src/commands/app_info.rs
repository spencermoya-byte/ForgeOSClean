use tauri::Manager;

#[tauri::command]
fn get_app_info() -> serde_json::Value {
    let window = tauri::WindowBuilder::new(tauri::AppHandle::default(), "main", Default::default())
        .build()
        .unwrap();
    let app_handle = window.app_handle();
    let package_info = app_handle.package_info();

    serde_json::json!({
        "name": package_info.name,
        "version": package_info.version,
        "description": package_info.description,
        "binaries": package_info.binaries
    })
}
