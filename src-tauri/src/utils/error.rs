use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ForgeOSError {
    #[error("Failed to get app info")]
    AppInfoError,
    #[error("Failed to get system info")]
    SystemInfoError,
    #[error("Failed to get workspace path")]
    WorkspacePathError,
    #[error("Authentication failed")]
    AuthenticationError,
    #[error("Database error")]
    DatabaseError,
    #[error("File system error")]
    FileSystemError,
    #[error("Execution error")]
    ExecutionError,
    #[error("Telemetry error")]
    TelemetryError,
    #[error("Unknown error")]
    UnknownError,
}

pub type Result<T> = std::result::Result<T, ForgeOSError>;
