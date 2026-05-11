use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct AiChatMessage {
    pub id: String,
    pub role: String, // "user", "assistant"
    pub content: String,
    pub created_at: String,
    pub model_id: Option<String>,
    pub provider_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AiChatSession {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
    pub messages: Vec<AiChatMessage>,
}
