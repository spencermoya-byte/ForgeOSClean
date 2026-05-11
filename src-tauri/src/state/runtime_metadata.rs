use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeMetadata {
    pub start_time: String,
}

impl Default for RuntimeMetadata {
    fn default() -> Self {
        RuntimeMetadata {
            start_time: chrono::Utc::now().to_rfc3339(),
        }
    }
}
