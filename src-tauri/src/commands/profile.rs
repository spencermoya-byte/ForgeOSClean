use serde::{Deserialize, Serialize};
use tauri::State;
use jsonwebtoken::{decode, Validation};
use chrono::{Utc, Duration};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[derive(Serialize, Deserialize)]
struct UserProfile {
    username: String,
    email: String,
    // Add more fields as needed
}

#[tauri::command]
fn get_user_profile(token: &str) -> Result<UserProfile, String> {
    let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    match decode::<Claims>(token, &DecodingKey::from_secret("secret".as_ref()), &validation) {
        Ok(decoded) => {
            // Here you would typically fetch the user profile from a database
            if decoded.claims.sub == "admin" {
                Ok(UserProfile {
                    username: "admin".to_string(),
                    email: "admin@example.com".to_string(),
                })
            } else {
                Err("Invalid token".to_string())
            }
        }
        Err(_) => Err("Invalid token".to_string()),
    }
}

#[tauri::command]
fn update_user_profile(token: &str, new_profile: UserProfile) -> Result<String, String> {
    let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    match decode::<Claims>(token, &DecodingKey::from_secret("secret".as_ref()), &validation) {
        Ok(decoded) => {
            // Here you would typically update the user profile in a database
            if decoded.claims.sub == "admin" {
                Ok("Profile updated successfully".to_string())
            } else {
                Err("Invalid token".to_string())
            }
        }
        Err(_) => Err("Invalid token".to_string()),
    }
}

#[tauri::command]
fn update_user_password(token: &str, new_password: String) -> Result<String, String> {
    let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    match decode::<Claims>(token, &DecodingKey::from_secret("secret".as_ref()), &validation) {
        Ok(decoded) => {
            // Here you would typically update the user password in a database
            if decoded.claims.sub == "admin" {
                Ok("Password updated successfully".to_string())
            } else {
                Err("Invalid token".to_string())
            }
        }
        Err(_) => Err("Invalid token".to_string()),
    }
}

#[derive(Default)]
struct ProfileState {
    // You can add more state here if needed
}

impl State<ProfileState> for ProfileState {}
