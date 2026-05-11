use thiserror::Error;

#[derive(Debug, Error)]
pub enum ForgeOSError {
    #[error("Failed to get app info")]
    AppInfoError,
    #[error("Failed to get system info")]
    SystemInfoError,
    #[error("Failed to get workspace path")]
    WorkspacePathError,
}

pub type Result<T> = std::result::Result<T, ForgeOSError>;
