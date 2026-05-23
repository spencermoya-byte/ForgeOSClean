use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::Duration;

const OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";
const OLLAMA_TIMEOUT_SECONDS: u64 = 120;

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaModelInfo {
    pub name: String,
    pub size: Option<u64>,
    pub modified_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaStatusResponse {
    pub ok: bool,
    pub models: Vec<OllamaModelInfo>,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaGenerateRequest {
    pub model: String,
    pub prompt: String,
    #[serde(rename = "systemPrompt")]
    pub system_prompt: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaGenerateResponse {
    pub ok: bool,
    pub model: String,
    pub response: String,
    #[serde(rename = "blockedReason")]
    pub blocked_reason: Option<String>,
}

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaTagModel>,
}

#[derive(Deserialize)]
struct OllamaTagModel {
    name: String,
    size: Option<u64>,
    modified_at: Option<String>,
}

#[derive(Deserialize)]
struct OllamaGenerateRawResponse {
    response: Option<String>,
}

fn client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(OLLAMA_TIMEOUT_SECONDS))
        .build()
        .map_err(|error| format!("Unable to create Ollama HTTP client: {error}"))
}

#[tauri::command]
pub async fn vivus_ollama_status() -> Result<OllamaStatusResponse, String> {
    let http = client()?;
    let response = match http.get(format!("{OLLAMA_BASE_URL}/api/tags")).send().await {
        Ok(value) => value,
        Err(error) => {
            return Ok(OllamaStatusResponse {
                ok: false,
                models: vec![],
                blocked_reason: Some(format!("Unable to reach Ollama at {OLLAMA_BASE_URL}. {error}")),
            });
        }
    };

    if !response.status().is_success() {
        return Ok(OllamaStatusResponse {
            ok: false,
            models: vec![],
            blocked_reason: Some(format!("Ollama responded with HTTP {}.", response.status())),
        });
    }

    let tags = response
        .json::<OllamaTagsResponse>()
        .await
        .map_err(|error| format!("Unable to parse Ollama model list: {error}"))?;

    Ok(OllamaStatusResponse {
        ok: true,
        models: tags
            .models
            .into_iter()
            .map(|model| OllamaModelInfo {
                name: model.name,
                size: model.size,
                modified_at: model.modified_at,
            })
            .collect(),
        blocked_reason: None,
    })
}

#[tauri::command]
pub async fn vivus_ollama_generate(request: OllamaGenerateRequest) -> Result<OllamaGenerateResponse, String> {
    let model = request.model.trim().to_string();
    let prompt = request.prompt.trim().to_string();

    if model.is_empty() {
        return Ok(OllamaGenerateResponse {
            ok: false,
            model,
            response: String::new(),
            blocked_reason: Some("Model is required.".to_string()),
        });
    }

    if prompt.is_empty() {
        return Ok(OllamaGenerateResponse {
            ok: false,
            model,
            response: String::new(),
            blocked_reason: Some("Prompt is required.".to_string()),
        });
    }

    let http = client()?;
    let mut payload = json!({
        "model": model,
        "prompt": prompt,
        "stream": false,
    });

    if let Some(system_prompt) = request.system_prompt.filter(|value| !value.trim().is_empty()) {
        payload["system"] = json!(system_prompt);
    }

    let response = match http.post(format!("{OLLAMA_BASE_URL}/api/generate")).json(&payload).send().await {
        Ok(value) => value,
        Err(error) => {
            return Ok(OllamaGenerateResponse {
                ok: false,
                model,
                response: String::new(),
                blocked_reason: Some(format!("Unable to reach Ollama generation endpoint. {error}")),
            });
        }
    };

    if !response.status().is_success() {
        return Ok(OllamaGenerateResponse {
            ok: false,
            model,
            response: String::new(),
            blocked_reason: Some(format!("Ollama generation failed with HTTP {}.", response.status())),
        });
    }

    let raw = response
        .json::<OllamaGenerateRawResponse>()
        .await
        .map_err(|error| format!("Unable to parse Ollama generation response: {error}"))?;

    Ok(OllamaGenerateResponse {
        ok: true,
        model,
        response: raw.response.unwrap_or_default(),
        blocked_reason: None,
    })
}
