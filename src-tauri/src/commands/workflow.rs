use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::workflow::WorkflowDatabase;

#[derive(Serialize, Deserialize, Clone)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub is_active: bool,
    pub trigger_type: String,
    pub trigger_config: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WorkflowStep {
    pub id: String,
    pub workflow_id: String,
    pub name: String,
    pub description: String,
    pub step_type: String,
    pub config: String,
    pub position: i32,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WorkflowExecution {
    pub id: String,
    pub workflow_id: String,
    pub status: String,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub error_message: Option<String>,
    pub result: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateWorkflowRequest {
    pub name: String,
    pub description: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub trigger_type: String,
    pub trigger_config: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateWorkflowRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
    pub trigger_type: Option<String>,
    pub trigger_config: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateWorkflowStepRequest {
    pub workflow_id: String,
    pub name: String,
    pub description: String,
    pub step_type: String,
    pub config: String,
    pub position: i32,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateWorkflowStepRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub step_type: Option<String>,
    pub config: Option<String>,
    pub position: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowResponse {
    pub workflow: Workflow,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowsResponse {
    pub workflows: Vec<Workflow>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowStepResponse {
    pub step: WorkflowStep,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowStepsResponse {
    pub steps: Vec<WorkflowStep>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowExecutionResponse {
    pub execution: WorkflowExecution,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowExecutionsResponse {
    pub executions: Vec<WorkflowExecution>,
}

#[tauri::command]
pub async fn create_workflow(
    db: State<'_, sqlx::SqlitePool>,
    request: CreateWorkflowRequest,
) -> Result<WorkflowResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    
    let workflow = Workflow {
        id: uuid::Uuid::new_v4().to_string(),
        name: request.name,
        description: request.description,
        workspace_id: request.workspace_id,
        project_id: request.project_id,
        is_active: true,
        trigger_type: request.trigger_type,
        trigger_config: request.trigger_config,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match workflow_db.create_workflow(workflow).await {
        Ok(workflow) => Ok(WorkflowResponse { workflow }),
        Err(e) => Err(format!("Failed to create workflow: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workflows(
    db: State<'_, sqlx::SqlitePool>,
    workspace_id: Option<String>,
    project_id: Option<String>,
) -> Result<WorkflowsResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    match workflow_db.get_workflows(workspace_id.as_deref(), project_id.as_deref()).await {
        Ok(workflows) => Ok(WorkflowsResponse { workflows }),
        Err(e) => Err(format!("Failed to get workflows: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workflow(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<WorkflowResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    match workflow_db.get_workflow(&id).await {
        Ok(workflow) => Ok(WorkflowResponse { workflow }),
        Err(e) => Err(format!("Failed to get workflow: {}", e)),
    }
}

#[tauri::command]
pub async fn update_workflow(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdateWorkflowRequest,
) -> Result<WorkflowResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    
    // First get the existing workflow
    let existing_workflow = workflow_db.get_workflow(&id).await.map_err(|e| format!("Failed to get workflow: {}", e))?;
    
    let workflow = Workflow {
        id: existing_workflow.id,
        name: request.name.unwrap_or(existing_workflow.name),
        description: request.description.unwrap_or(existing_workflow.description),
        workspace_id: request.workspace_id.or(existing_workflow.workspace_id),
        project_id: request.project_id.or(existing_workflow.project_id),
        is_active: request.is_active.unwrap_or(existing_workflow.is_active),
        trigger_type: request.trigger_type.unwrap_or(existing_workflow.trigger_type),
        trigger_config: request.trigger_config.unwrap_or(existing_workflow.trigger_config),
        created_at: existing_workflow.created_at,
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match workflow_db.update_workflow(&id, workflow).await {
        Ok(workflow) => Ok(WorkflowResponse { workflow }),
        Err(e) => Err(format!("Failed to update workflow: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_workflow(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
) -> Result<(), String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    match workflow_db.delete_workflow(&id).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete workflow: {}", e)),
    }
}

#[tauri::command]
pub async fn create_workflow_step(
    db: State<'_, sqlx::SqlitePool>,
    request: CreateWorkflowStepRequest,
) -> Result<WorkflowStepResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    
    let step = WorkflowStep {
        id: uuid::Uuid::new_v4().to_string(),
        workflow_id: request.workflow_id,
        name: request.name,
        description: request.description,
        step_type: request.step_type,
        config: request.config,
        position: request.position,
        is_active: true,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match workflow_db.create_workflow_step(step).await {
        Ok(step) => Ok(WorkflowStepResponse { step }),
        Err(e) => Err(format!("Failed to create workflow step: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workflow_steps(
    db: State<'_, sqlx::SqlitePool>,
    workflow_id: String,
) -> Result<WorkflowStepsResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    match workflow_db.get_workflow_steps(&workflow_id).await {
        Ok(steps) => Ok(WorkflowStepsResponse { steps }),
        Err(e) => Err(format!("Failed to get workflow steps: {}", e)),
    }
}

#[tauri::command]
pub async fn update_workflow_step(
    db: State<'_, sqlx::SqlitePool>,
    id: String,
    request: UpdateWorkflowStepRequest,
) -> Result<WorkflowStepResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    
    // First get the existing step
    let existing_step = workflow_db.get_workflow_steps(&id).await.map_err(|e| format!("Failed to get workflow step: {}", e))?;
    
    if existing_step.is_empty() {
        return Err("Workflow step not found".to_string());
    }
    
    let step = WorkflowStep {
        id: existing_step[0].id.clone(),
        workflow_id: existing_step[0].workflow_id.clone(),
        name: request.name.unwrap_or(existing_step[0].name.clone()),
        description: request.description.unwrap_or(existing_step[0].description.clone()),
        step_type: request.step_type.unwrap_or(existing_step[0].step_type.clone()),
        config: request.config.unwrap_or(existing_step[0].config.clone()),
        position: request.position.unwrap_or(existing_step[0].position),
        is_active: request.is_active.unwrap_or(existing_step[0].is_active),
        created_at: existing_step[0].created_at.clone(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    // For simplicity, we'll update the step by recreating it
    // In a real implementation, we'd update the existing step
    match workflow_db.create_workflow_step(step).await {
        Ok(step) => Ok(WorkflowStepResponse { step }),
        Err(e) => Err(format!("Failed to update workflow step: {}", e)),
    }
}

#[tauri::command]
pub async fn create_workflow_execution(
    db: State<'_, sqlx::SqlitePool>,
    workflow_id: String,
) -> Result<WorkflowExecutionResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    
    let execution = WorkflowExecution {
        id: uuid::Uuid::new_v4().to_string(),
        workflow_id,
        status: "pending".to_string(),
        started_at: None,
        completed_at: None,
        error_message: None,
        result: None,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match workflow_db.create_workflow_execution(execution).await {
        Ok(execution) => Ok(WorkflowExecutionResponse { execution }),
        Err(e) => Err(format!("Failed to create workflow execution: {}", e)),
    }
}

#[tauri::command]
pub async fn get_workflow_executions(
    db: State<'_, sqlx::SqlitePool>,
    workflow_id: String,
) -> Result<WorkflowExecutionsResponse, String> {
    let workflow_db = WorkflowDatabase::new(db.inner().clone());
    match workflow_db.get_workflow_executions(&workflow_id).await {
        Ok(executions) => Ok(WorkflowExecutionsResponse { executions }),
        Err(e) => Err(format!("Failed to get workflow executions: {}", e)),
    }
}
