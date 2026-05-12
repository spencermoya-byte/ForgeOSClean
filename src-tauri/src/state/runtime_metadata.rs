use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeMetadata {
    pub start_time: String,
    pub version: String,
    pub platform: String,
    pub is_development: bool,
}

impl Default for RuntimeMetadata {
    fn default() -> Self {
        RuntimeMetadata {
            start_time: chrono::Utc::now().to_rfc3339(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            platform: std::env::consts::OS.to_string(),
            is_development: cfg!(debug_assertions),
        }
    }
}
