use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize, Clone)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: String,
    pub username: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RegisterResponse {
    pub user_id: String,
    pub username: String,
    pub email: String,
}

#[tauri::command]
pub async fn login(
    _db: State<'_, sqlx::SqlitePool>,
    request: LoginRequest,
) -> Result<LoginResponse, String> {
    // In a real implementation, this would authenticate the user
    // For now, we'll return a mock response
    
    Ok(LoginResponse {
        token: "mock_token_12345".to_string(),
        user_id: "user_123".to_string(),
        username: request.username,
        email: "user@example.com".to_string(),
    })
}

#[tauri::command]
pub async fn register(
    _db: State<'_, sqlx::SqlitePool>,
    request: RegisterRequest,
) -> Result<RegisterResponse, String> {
    // In a real implementation, this would register a new user
    // For now, we'll return a mock response
    
    Ok(RegisterResponse {
        user_id: "user_123".to_string(),
        username: request.username,
        email: request.email,
    })
}

#[tauri::command]
pub async fn logout(
    _db: State<'_, sqlx::SqlitePool>,
) -> Result<(), String> {
    // In a real implementation, this would invalidate the session
    // For now, we'll return success
    
    Ok(())
}
