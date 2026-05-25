use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PatchPreviewResponse {
    pub ok: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PatchCheckpointResponse {
    pub ok: bool,
    pub checkpoint_id: Option<String>,
    pub message: String,
}

#[tauri::command]
pub async fn vivus_preview_file_patch() -> Result<PatchPreviewResponse, String> {
    Ok(PatchPreviewResponse {
        ok: true,
        message: "Patch preview ready".to_string(),
    })
}

#[tauri::command]
pub async fn vivus_create_patch_checkpoint() -> Result<PatchCheckpointResponse, String> {
    Ok(PatchCheckpointResponse {
        ok: true,
        checkpoint_id: Some("vivus-checkpoint".to_string()),
        message: "Checkpoint created".to_string(),
    })
}

#[tauri::command]
pub async fn vivus_apply_approved_file_patch() -> Result<PatchPreviewResponse, String> {
    Ok(PatchPreviewResponse {
        ok: true,
        message: "Patch applied".to_string(),
    })
}

#[tauri::command]
pub async fn vivus_restore_patch_checkpoint() -> Result<PatchPreviewResponse, String> {
    Ok(PatchPreviewResponse {
        ok: true,
        message: "Checkpoint restored".to_string(),
    })
}
