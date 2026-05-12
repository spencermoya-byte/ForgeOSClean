use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub language: String,
    pub auto_save: bool,
    pub auto_backup: bool,
    pub telemetry_enabled: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            theme: "dark".to_string(),
            language: "en".to_string(),
            auto_save: true,
            auto_backup: true,
            telemetry_enabled: true,
        }
    }
}
