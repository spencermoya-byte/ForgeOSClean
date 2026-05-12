use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineeringWorkspace {
    pub id: String,
    pub name: String,
    pub description: String,
    pub project_id: String,
    pub workspace_id: String,
    pub context: WorkspaceContext,
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceContext {
    pub project_context: ProjectContext,
    pub file_context: FileContext,
    pub dependency_context: DependencyContext,
    pub workflow_context: WorkflowContext,
    pub ai_context: AIContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectContext {
    pub project_id: String,
    pub project_name: String,
    pub project_description: String,
    pub project_dependencies: Vec<String>,
    pub project_structure: ProjectStructure,
    pub project_history: Vec<HistoryEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStructure {
    pub files: Vec<String>,
    pub directories: Vec<String>,
    pub file_types: HashMap<String, usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileContext {
    pub current_file: Option<String>,
    pub open_files: Vec<String>,
    pub recent_files: Vec<String>,
    pub file_dependencies: HashMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyContext {
    pub direct_dependencies: Vec<Dependency>,
    pub transitive_dependencies: Vec<Dependency>,
    pub dependency_graph: DependencyGraph,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    pub name: String,
    pub version: String,
    pub type_: String,
    pub location: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyGraph {
    pub nodes: Vec<DependencyNode>,
    pub edges: Vec<DependencyEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyNode {
    pub id: String,
    pub name: String,
    pub type_: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyEdge {
    pub from: String,
    pub to: String,
    pub type_: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowContext {
    pub active_workflow: Option<String>,
    pub workflow_history: Vec<String>,
    pub workflow_steps: Vec<WorkflowStep>,
    pub workflow_status: WorkflowStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: StepStatus,
    pub execution_time: Option<String>,
    pub results: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StepStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStatus {
    pub status: String,
    pub progress: f32,
    pub current_step: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIContext {
    pub ai_model: String,
    pub ai_provider: String,
    pub context_tokens: usize,
    pub last_prompt: Option<String>,
    pub last_response: Option<String>,
    pub ai_capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEvent {
    pub id: String,
    pub event_type: String,
    pub timestamp: String,
    pub details: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineeringWorkspaceState {
    pub active_workspace: Option<String>,
    pub workspaces: HashMap<String, EngineeringWorkspace>,
    pub context_cache: HashMap<String, WorkspaceContext>,
    pub metadata_cache: HashMap<String, serde_json::Value>,
}

impl EngineeringWorkspace {
    pub fn new(
        id: String,
        name: String,
        description: String,
        project_id: String,
        workspace_id: String,
    ) -> Self {
        Self {
            id,
            name,
            description,
            project_id,
            workspace_id,
            context: WorkspaceContext {
                project_context: ProjectContext {
                    project_id: project_id.clone(),
                    project_name: name.clone(),
                    project_description: description.clone(),
                    project_dependencies: vec![],
                    project_structure: ProjectStructure {
                        files: vec![],
                        directories: vec![],
                        file_types: HashMap::new(),
                    },
                    project_history: vec![],
                },
                file_context: FileContext {
                    current_file: None,
                    open_files: vec![],
                    recent_files: vec![],
                    file_dependencies: HashMap::new(),
                },
                dependency_context: DependencyContext {
                    direct_dependencies: vec![],
                    transitive_dependencies: vec![],
                    dependency_graph: DependencyGraph {
                        nodes: vec![],
                        edges: vec![],
                    },
                },
                workflow_context: WorkflowContext {
                    active_workflow: None,
                    workflow_history: vec![],
                    workflow_steps: vec![],
                    workflow_status: WorkflowStatus {
                        status: "idle".to_string(),
                        progress: 0.0,
                        current_step: None,
                        error: None,
                    },
                },
                ai_context: AIContext {
                    ai_model: "default".to_string(),
                    ai_provider: "local".to_string(),
                    context_tokens: 0,
                    last_prompt: None,
                    last_response: None,
                    ai_capabilities: vec![],
                },
            },
            metadata: HashMap::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

impl EngineeringWorkspaceState {
    pub fn new() -> Self {
        Self {
            active_workspace: None,
            workspaces: HashMap::new(),
            context_cache: HashMap::new(),
            metadata_cache: HashMap::new(),
        }
    }
}
