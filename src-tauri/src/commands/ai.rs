use serde::{Deserialize, Serialize};
use tauri::State;
use crate::ai::service::*;
use crate::ai::model::{AiModel, ModelResponse, ModelStatus};
use crate::ai::provider::{AiProvider, ProviderResponse, ProviderStatus};

#[derive(Serialize, Deserialize, Clone)]
pub struct AiRequest {
    pub prompt: String,
    pub model_id: Option<String>,
    pub provider_id: Option<String>,
    pub context: Option<AiContext>,
    pub stream: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AiContext {
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub resource_id: Option<String>,
    pub file_path: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AiResponse {
    pub content: String,
    pub model_id: String,
    pub provider_id: String,
    pub tokens_used: Option<u32>,
    pub created_at: String,
}

#[tauri::command]
pub async fn get_ai_models(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<ModelResponse, String> {
    let response = crate::ai::service::get_ai_models(db).await;
    response
}

#[tauri::command]
pub async fn get_ai_providers(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<ProviderResponse, String> {
    let response = crate::ai::service::get_ai_providers(db).await;
    response
}

#[tauri::command]
pub async fn get_ai_model_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Vec<ModelStatus>, String> {
    let response = crate::ai::service::get_ai_model_status(db).await;
    response
}

#[tauri::command]
pub async fn get_ai_provider_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Vec<ProviderStatus>, String> {
    let response = crate::ai::service::get_ai_provider_status(db).await;
    response
}

#[tauri::command]
pub async fn send_ai_request(
    db: State<'_, sqlx::SqlitePool>,
    request: AiRequest,
) -> Result<AiResponse, String> {
    let response = crate::ai::service::send_ai_request(db, request).await;
    response
}

#[tauri::command]
pub async fn create_ai_chat_session(
    db: State<'_, sqlx::SqlitePool>,
    title: String,
) -> Result<AiChatSession, String> {
    let response = crate::ai::service::create_ai_chat_session(db, title).await;
    response
}

#[tauri::command]
pub async fn send_ai_chat_message(
    db: State<'_, sqlx::SqlitePool>,
    session_id: String,
    message: String,
) -> Result<AiChatResponse, String> {
    let response = crate::ai::service::send_ai_chat_message(db, session_id, message).await;
    response
}

#[tauri::command]
pub async fn get_ai_chat_history(
    db: State<'_, sqlx::SqlitePool>,
    session_id: String,
) -> Result<Vec<AiChatMessage>, String> {
    let response = crate::ai::service::get_ai_chat_history(db, session_id).await;
    response
}
