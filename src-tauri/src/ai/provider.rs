use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct AiProvider {
    pub id: String,
    pub name: String,
    pub type_: String, // "local", "api", etc.
    pub base_url: String,
    pub api_key: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct ProviderResponse {
    pub providers: Vec<AiProvider>,
}

#[derive(Serialize, Deserialize)]
pub struct ProviderStatus {
    pub id: String,
    pub name: String,
    pub type_: String,
    pub is_available: bool,
    pub last_checked: String,
}
