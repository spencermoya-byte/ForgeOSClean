use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::workspace::WorkspaceDatabase;
use crate::database::project::ProjectDatabase;
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

#[derive(Serialize, Deserialize)]
pub struct AiChatMessage {
    pub id: String,
    pub role: String, // "user", "assistant"
    pub content: String,
    pub created_at: String,
    pub model_id: Option<String>,
    pub provider_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct AiChatSession {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
    pub messages: Vec<AiChatMessage>,
}

#[derive(Serialize, Deserialize)]
pub struct AiChatResponse {
    pub session_id: String,
    pub message: AiChatMessage,
}

#[tauri::command]
pub async fn get_ai_models(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<ModelResponse, String> {
    // For now, return a mock response - in a real implementation this would query the database
    let models = vec![
        AiModel {
            id: "ollama-gemma2".to_string(),
            name: "Gemma 2".to_string(),
            provider: "ollama".to_string(),
            description: "Lightweight model from Google".to_string(),
            is_active: true,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
        AiModel {
            id: "ollama-llama3".to_string(),
            name: "Llama 3".to_string(),
            provider: "ollama".to_string(),
            description: "Meta's latest large language model".to_string(),
            is_active: false,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    Ok(ModelResponse { models })
}

#[tauri::command]
pub async fn get_ai_providers(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<ProviderResponse, String> {
    // For now, return a mock response - in a real implementation this would query the database
    let providers = vec![
        AiProvider {
            id: "ollama".to_string(),
            name: "Ollama".to_string(),
            type_: "local".to_string(),
            base_url: "http://localhost:11434".to_string(),
            api_key: None,
            is_active: true,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    Ok(ProviderResponse { providers })
}

#[tauri::command]
pub async fn get_ai_model_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Vec<ModelStatus>, String> {
    // For now, return a mock response - in a real implementation this would check actual model availability
    let statuses = vec![
        ModelStatus {
            id: "ollama-gemma2".to_string(),
            name: "Gemma 2".to_string(),
            provider: "ollama".to_string(),
            is_available: true,
            last_checked: chrono::Utc::now().to_rfc3339(),
        },
        ModelStatus {
            id: "ollama-llama3".to_string(),
            name: "Llama 3".to_string(),
            provider: "ollama".to_string(),
            is_available: true,
            last_checked: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    Ok(statuses)
}

#[tauri::command]
pub async fn get_ai_provider_status(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Vec<ProviderStatus>, String> {
    // For now, return a mock response - in a real implementation this would check actual provider availability
    let statuses = vec![
        ProviderStatus {
            id: "ollama".to_string(),
            name: "Ollama".to_string(),
            type_: "local".to_string(),
            is_available: true,
            last_checked: chrono::Utc::now().to_rfc3339(),
        },
    ];
    
    Ok(statuses)
}

#[tauri::command]
pub async fn send_ai_request(
    db: State<'_, sqlx::SqlitePool>,
    request: AiRequest,
) -> Result<AiResponse, String> {
    // For now, return a mock response - in a real implementation this would call the AI provider
    let response = AiResponse {
        content: "This is a mock AI response based on your request.".to_string(),
        model_id: request.model_id.unwrap_or_else(|| "ollama-gemma2".to_string()),
        provider_id: request.provider_id.unwrap_or_else(|| "ollama".to_string()),
        tokens_used: Some(128),
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(response)
}

#[tauri::command]
pub async fn create_ai_chat_session(
    db: State<'_, sqlx::SqlitePool>,
    title: String,
) -> Result<AiChatSession, String> {
    let session_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    let session = AiChatSession {
        id: session_id,
        title,
        created_at: now.clone(),
        updated_at: now,
        messages: vec![],
    };
    
    Ok(session)
}

#[tauri::command]
pub async fn send_ai_chat_message(
    db: State<'_, sqlx::SqlitePool>,
    session_id: String,
    message: String,
) -> Result<AiChatResponse, String> {
    let message_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    let chat_message = AiChatMessage {
        id: message_id,
        role: "user".to_string(),
        content: message,
        created_at: now.clone(),
        model_id: None,
        provider_id: None,
    };
    
    let response = AiChatResponse {
        session_id,
        message: chat_message,
    };
    
    Ok(response)
}

#[tauri::command]
pub async fn get_ai_chat_history(
    db: State<'_, sqlx::SqlitePool>,
    session_id: String,
) -> Result<Vec<AiChatMessage>, String> {
    // For now, return empty history - in a real implementation this would query the database
    Ok(vec![])
}
