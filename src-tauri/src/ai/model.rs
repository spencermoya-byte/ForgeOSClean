use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct AiModel {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub description: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct ModelResponse {
    pub models: Vec<AiModel>,
}

#[derive(Serialize, Deserialize)]
pub struct ModelStatus {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub is_available: bool,
    pub last_checked: String,
}
