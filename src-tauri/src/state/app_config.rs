use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub language: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            theme: "dark".to_string(),
            language: "en".to_string(),
        }
    }
}
