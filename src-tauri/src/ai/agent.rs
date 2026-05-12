use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::agent::AgentDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub type_: String, // "local", "remote", "plugin"
    pub capabilities: Vec<String>,
    pub is_active: bool,
    pub config: String, // JSON configuration
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentCapability {
    pub id: String,
    pub agent_id: String,
    pub capability: String,
    pub is_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentExecution {
    pub id: String,
    pub agent_id: String,
    pub task_id: String,
    pub status: String, // "pending", "running", "completed", "failed", "cancelled"
    pub result: Option<String>,
    pub error_message: Option<String>,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentTask {
    pub id: String,
    pub agent_id: String,
    pub name: String,
    pub description: String,
    pub context: String, // JSON context
    pub priority: i32,
    pub status: String, // "pending", "running", "completed", "failed", "cancelled"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentExecutionRequest {
    pub agent_id: String,
    pub task: AgentTask,
    pub context: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentExecutionResponse {
    pub execution: AgentExecution,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentTaskResponse {
    pub task: AgentTask,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentResponse {
    pub agent: Agent,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentsResponse {
    pub agents: Vec<Agent>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentCapabilitiesResponse {
    pub capabilities: Vec<AgentCapability>,
}

#[tauri::command]
pub async fn get_agents(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<AgentsResponse, String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.get_agents().await {
        Ok(agents) => Ok(AgentsResponse { agents }),
        Err(e) => Err(format!("Failed to get agents: {}", e)),
    }
}

#[tauri::command]
pub async fn get_agent(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<AgentResponse, String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.get_agent(&id).await {
        Ok(agent) => Ok(AgentResponse { agent }),
        Err(e) => Err(format!("Failed to get agent: {}", e)),
    }
}

#[tauri::command]
pub async fn create_agent(
    db: State<'_, sqlx::SqlitePool>,
    agent: Agent,
) -> Result<AgentResponse, String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.create_agent(agent).await {
        Ok(agent) => Ok(AgentResponse { agent }),
        Err(e) => Err(format!("Failed to create agent: {}", e)),
    }
}

#[tauri::command]
pub async fn update_agent(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    agent: Agent,
) -> Result<AgentResponse, String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.update_agent(&id, agent).await {
        Ok(agent) => Ok(AgentResponse { agent }),
        Err(e) => Err(format!("Failed to update agent: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_agent(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.delete_agent(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete agent: {}", e)),
    }
}

#[tauri::command]
pub async fn get_agent_capabilities(
    db: State<'_, sqlx::SqlitePool>,
    agent_id: String,
) -> Result<AgentCapabilitiesResponse, String> {
    let agent_db = AgentDatabase::new(db.inner().clone());
    match agent_db.get_agent_capabilities(&agent_id).await {
        Ok(capabilities) => Ok(AgentCapabilitiesResponse { capabilities }),
        Err(e) => Err(format!("Failed to get agent capabilities: {}", e)),
    }
}

#[tauri::command]
pub async fn execute_agent_task(
    db: State<'_, sqlx::SqlitePool>,
    request: AgentExecutionRequest,
) -> Result<AgentExecutionResponse, String> {
    // In a real implementation, this would execute the agent task
    // For now, we'll return a mock execution
    
    let execution = AgentExecution {
        id: uuid::Uuid::new_v4().to_string(),
        agent_id: request.agent_id,
        task_id: request.task.id,
        status: "completed".to_string(),
        result: Some("Task executed successfully".to_string()),
        error_message: None,
        started_at: Some(chrono::Utc::now().to_rfc3339()),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(AgentExecutionResponse { execution })
}
