use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::execution::{ExecutionDatabase, ExecutionRequest, ExecutionStatus, ToolDefinition, ExecutionHistory, SandboxConfiguration};

#[derive(Serialize, Deserialize, Clone)]
pub struct ExecutionRequestPayload {
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub tool_id: String,
    pub command: String,
    pub arguments: Vec<String>,
    pub working_directory: String,
    pub environment: serde_json::Value,
    pub timeout: Option<u32>,
    pub is_sandboxed: Option<bool>,
    pub is_restricted: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExecutionStatusResponse {
    pub execution_id: String,
    pub status: String,
    pub progress: f32,
    pub output: String,
    pub error: Option<String>,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ToolDefinitionResponse {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub executable: String,
    pub arguments: Vec<String>,
    pub capabilities: Vec<String>,
    pub is_system: bool,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExecutionHistoryResponse {
    pub id: String,
    pub execution_id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub tool_id: String,
    pub command: String,
    pub status: String,
    pub exit_code: Option<i32>,
    pub duration: Option<u64>,
    pub started_at: String,
    pub completed_at: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SandboxConfigurationResponse {
    pub id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub is_enabled: bool,
    pub allowed_commands: Vec<String>,
    pub allowed_paths: Vec<String>,
    pub max_memory: u64,
    pub max_cpu: f32,
    pub timeout: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[tauri::command]
pub async fn submit_execution_request(
    db: State<'_, sqlx::SqlitePool>,
    request: ExecutionRequestPayload,
) -> Result<ExecutionStatusResponse, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    // Create execution request
    let execution_request = ExecutionRequest {
        id: uuid::Uuid::new_v4().to_string(),
        workspace_id: request.workspace_id,
        project_id: request.project_id,
        tool_id: request.tool_id,
        command: request.command,
        arguments: request.arguments,
        working_directory: request.working_directory,
        environment: serde_json::to_string(&request.environment).unwrap_or_default(),
        timeout: request.timeout.unwrap_or(300), // Default 5 minutes
        is_sandboxed: request.is_sandboxed.unwrap_or(true),
        is_restricted: request.is_restricted.unwrap_or(true),
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    // Save execution request
    let saved_request = execution_db.create_execution_request(execution_request).await
        .map_err(|e| format!("Failed to create execution request: {}", e))?;
    
    // Create initial execution status
    let status = ExecutionStatus {
        id: uuid::Uuid::new_v4().to_string(),
        execution_id: saved_request.id.clone(),
        status: "pending".to_string(),
        progress: 0.0,
        output: String::new(),
        error: None,
        started_at: None,
        completed_at: None,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    execution_db.create_execution_status(status).await
        .map_err(|e| format!("Failed to create execution status: {}", e))?;
    
    // In a real implementation, this would start the actual execution
    // For now, we'll return a mock response
    
    Ok(ExecutionStatusResponse {
        execution_id: saved_request.id,
        status: "pending".to_string(),
        progress: 0.0,
        output: String::new(),
        error: None,
        started_at: None,
        completed_at: None,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn get_execution_status(
    db: State<'_, sqlx::SqlitePool>,
    execution_id: String,
) -> Result<ExecutionStatusResponse, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    let status = execution_db.get_execution_status(&execution_id).await
        .map_err(|e| format!("Failed to get execution status: {}", e))?;
    
    Ok(ExecutionStatusResponse {
        execution_id: status.execution_id,
        status: status.status,
        progress: status.progress,
        output: status.output,
        error: status.error,
        started_at: status.started_at,
        completed_at: status.completed_at,
        created_at: status.created_at,
    })
}

#[tauri::command]
pub async fn get_tool_definitions(
    db: State<'_, sqlx::SqlitePool>,
) -> Result<Vec<ToolDefinitionResponse>, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    // In a real implementation, this would fetch all tools
    // For now, we'll return a mock response
    
    Ok(vec![
        ToolDefinitionResponse {
            id: "tool_1".to_string(),
            name: "Git".to_string(),
            description: "Git version control system".to_string(),
            version: "2.30.0".to_string(),
            executable: "git".to_string(),
            arguments: vec!["--version".to_string()],
            capabilities: vec!["version_control".to_string(), "source_control".to_string()],
            is_system: true,
            is_active: true,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
        ToolDefinitionResponse {
            id: "tool_2".to_string(),
            name: "Node.js".to_string(),
            description: "Node.js runtime environment".to_string(),
            version: "16.14.0".to_string(),
            executable: "node".to_string(),
            arguments: vec!["--version".to_string()],
            capabilities: vec!["javascript_runtime".to_string(), "nodejs".to_string()],
            is_system: true,
            is_active: true,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    ])
}

#[tauri::command]
pub async fn get_execution_history(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
    project_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<ExecutionHistoryResponse>, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    let history = execution_db.get_execution_history(&workspace_id, project_id.as_deref(), limit.unwrap_or(50) as i32)
        .await
        .map_err(|e| format!("Failed to get execution history: {}", e))?;
    
    let mut response = Vec::new();
    for item in history {
        response.push(ExecutionHistoryResponse {
            id: item.id,
            execution_id: item.execution_id,
            workspace_id: item.workspace_id,
            project_id: item.project_id,
            tool_id: item.tool_id,
            command: item.command,
            status: item.status,
            exit_code: item.exit_code,
            duration: item.duration,
            started_at: item.started_at,
            completed_at: item.completed_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
        });
    }
    
    Ok(response)
}

#[tauri::command]
pub async fn get_sandbox_configuration(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
    project_id: Option<String>,
) -> Result<SandboxConfigurationResponse, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    let config = execution_db.get_sandbox_configuration(&workspace_id, project_id.as_deref())
        .await
        .map_err(|e| format!("Failed to get sandbox configuration: {}", e))?;
    
    Ok(SandboxConfigurationResponse {
        id: config.id,
        workspace_id: config.workspace_id,
        project_id: config.project_id,
        is_enabled: config.is_enabled,
        allowed_commands: config.allowed_commands,
        allowed_paths: config.allowed_paths,
        max_memory: config.max_memory,
        max_cpu: config.max_cpu,
        timeout: config.timeout,
        created_at: config.created_at,
        updated_at: config.updated_at,
    })
}

#[tauri::command]
pub async fn update_sandbox_configuration(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: String,
    project_id: Option<String>,
    is_enabled: bool,
    allowed_commands: Vec<String>,
    allowed_paths: Vec<String>,
    max_memory: u64,
    max_cpu: f32,
    timeout: u32,
) -> Result<SandboxConfigurationResponse, String> {
    let execution_db = ExecutionDatabase::new(db.inner().clone());
    
    let config = SandboxConfiguration {
        id: uuid::Uuid::new_v4().to_string(),
        workspace_id,
        project_id,
        is_enabled,
        allowed_commands,
        allowed_paths,
        max_memory,
        max_cpu,
        timeout,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    let saved_config = execution_db.create_sandbox_configuration(config)
        .await
        .map_err(|e| format!("Failed to create sandbox configuration: {}", e))?;
    
    Ok(SandboxConfigurationResponse {
        id: saved_config.id,
        workspace_id: saved_config.workspace_id,
        project_id: saved_config.project_id,
        is_enabled: saved_config.is_enabled,
        allowed_commands: saved_config.allowed_commands,
        allowed_paths: saved_config.allowed_paths,
        max_memory: saved_config.max_memory,
        max_cpu: saved_config.max_cpu,
        timeout: saved_config.timeout,
        created_at: saved_config.created_at,
        updated_at: saved_config.updated_at,
    })
}
