use serde::{Deserialize, Serialize};
use tauri::State;
use jsonwebtoken::{encode, decode, Header, EncodingKey, DecodingKey, Validation};
use chrono::{Utc, Duration};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[tauri::command]
fn login(username: &str, password: &str) -> Result<String, String> {
    // Here you would typically validate the username and password against a database
    if username == "admin" && password == "password" {
        let claims = Claims {
            sub: username.to_string(),
            exp: (Utc::now() + Duration::hours(1)).timestamp() as usize,
        };
        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref()))
            .map_err(|_| "Failed to encode JWT")?;
        Ok(token)
    } else {
        Err("Invalid credentials".to_string())
    }
}

#[tauri::command]
fn register(username: &str, password: &str) -> Result<String, String> {
    // Here you would typically save the username and hashed password to a database
    if username == "admin" && password == "password" {
        Ok("User registered successfully".to_string())
    } else {
        Err("Failed to register user".to_string())
    }
}

#[tauri::command]
fn logout() -> Result<String, String> {
    // Here you would typically clear the session or token
    Ok("Logged out successfully".to_string())
}

#[tauri::command]
fn get_user_info(token: &str) -> Result<serde_json::Value, String> {
    let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    match decode::<Claims>(token, &DecodingKey::from_secret("secret".as_ref()), &validation) {
        Ok(decoded) => {
            Ok(serde_json::json!({
                "username": decoded.claims.sub,
            }))
        }
        Err(_) => Err("Invalid token".to_string()),
    }
}

#[derive(Default)]
struct AuthState {
    // You can add more state here if needed
}

impl State<AuthState> for AuthState {}
