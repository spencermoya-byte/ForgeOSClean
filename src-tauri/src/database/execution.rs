use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct ExecutionRequest {
    pub id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub tool_id: String,
    pub command: String,
    pub arguments: Vec<String>,
    pub working_directory: String,
    pub environment: String, // JSON string
    pub timeout: u32,
    pub is_sandboxed: bool,
    pub is_restricted: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ExecutionStatus {
    pub id: String,
    pub execution_id: String,
    pub status: String, // "pending", "running", "completed", "failed", "cancelled"
    pub progress: f32,
    pub output: String,
    pub error: Option<String>,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ToolDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub executable: String,
    pub arguments: Vec<String>,
    pub capabilities: Vec<String>, // JSON array of capabilities
    pub is_system: bool,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ExecutionHistory {
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

#[derive(Debug, Clone)]
pub struct SandboxConfiguration {
    pub id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub is_enabled: bool,
    pub allowed_commands: Vec<String>, // JSON array
    pub allowed_paths: Vec<String>, // JSON array
    pub max_memory: u64,
    pub max_cpu: f32,
    pub timeout: u32,
    pub created_at: String,
    pub updated_at: String,
}

pub struct ExecutionDatabase {
    pool: SqlitePool,
}

impl ExecutionDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        ExecutionDatabase { pool }
    }

    pub async fn create_execution_request(&self, request: ExecutionRequest) -> Result<ExecutionRequest, sqlx::Error> {
        let query = r#"
            INSERT INTO execution_requests (id, workspace_id, project_id, tool_id, command, arguments, working_directory, environment, timeout, is_sandboxed, is_restricted, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&request.id)
            .bind(&request.workspace_id)
            .bind(&request.project_id)
            .bind(&request.tool_id)
            .bind(&request.command)
            .bind(&request.arguments.join(","))
            .bind(&request.working_directory)
            .bind(&request.environment)
            .bind(&request.timeout)
            .bind(&request.is_sandboxed)
            .bind(&request.is_restricted)
            .bind(&request.created_at)
            .bind(&request.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionRequest {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            tool_id: row.get("tool_id"),
            command: row.get("command"),
            arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
            working_directory: row.get("working_directory"),
            environment: row.get("environment"),
            timeout: row.get("timeout"),
            is_sandboxed: row.get("is_sandboxed"),
            is_restricted: row.get("is_restricted"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_execution_request(&self, id: &str) -> Result<ExecutionRequest, sqlx::Error> {
        let query = r#"
            SELECT * FROM execution_requests WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionRequest {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            tool_id: row.get("tool_id"),
            command: row.get("command"),
            arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
            working_directory: row.get("working_directory"),
            environment: row.get("environment"),
            timeout: row.get("timeout"),
            is_sandboxed: row.get("is_sandboxed"),
            is_restricted: row.get("is_restricted"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_execution_request(&self, id: &str, request: ExecutionRequest) -> Result<ExecutionRequest, sqlx::Error> {
        let query = r#"
            UPDATE execution_requests 
            SET workspace_id = ?, project_id = ?, tool_id = ?, command = ?, arguments = ?, working_directory = ?, environment = ?, timeout = ?, is_sandboxed = ?, is_restricted = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&request.workspace_id)
            .bind(&request.project_id)
            .bind(&request.tool_id)
            .bind(&request.command)
            .bind(&request.arguments.join(","))
            .bind(&request.working_directory)
            .bind(&request.environment)
            .bind(&request.timeout)
            .bind(&request.is_sandboxed)
            .bind(&request.is_restricted)
            .bind(&request.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionRequest {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            tool_id: row.get("tool_id"),
            command: row.get("command"),
            arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
            working_directory: row.get("working_directory"),
            environment: row.get("environment"),
            timeout: row.get("timeout"),
            is_sandboxed: row.get("is_sandboxed"),
            is_restricted: row.get("is_restricted"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_execution_status(&self, status: ExecutionStatus) -> Result<ExecutionStatus, sqlx::Error> {
        let query = r#"
            INSERT INTO execution_status (id, execution_id, status, progress, output, error, started_at, completed_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&status.id)
            .bind(&status.execution_id)
            .bind(&status.status)
            .bind(&status.progress)
            .bind(&status.output)
            .bind(&status.error)
            .bind(&status.started_at)
            .bind(&status.completed_at)
            .bind(&status.created_at)
            .bind(&status.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionStatus {
            id: row.get("id"),
            execution_id: row.get("execution_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            output: row.get("output"),
            error: row.get("error"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_execution_status(&self, execution_id: &str) -> Result<ExecutionStatus, sqlx::Error> {
        let query = r#"
            SELECT * FROM execution_status WHERE execution_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(execution_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionStatus {
            id: row.get("id"),
            execution_id: row.get("execution_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            output: row.get("output"),
            error: row.get("error"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_execution_status(&self, id: &str, status: ExecutionStatus) -> Result<ExecutionStatus, sqlx::Error> {
        let query = r#"
            UPDATE execution_status 
            SET execution_id = ?, status = ?, progress = ?, output = ?, error = ?, started_at = ?, completed_at = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&status.execution_id)
            .bind(&status.status)
            .bind(&status.progress)
            .bind(&status.output)
            .bind(&status.error)
            .bind(&status.started_at)
            .bind(&status.completed_at)
            .bind(&status.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionStatus {
            id: row.get("id"),
            execution_id: row.get("execution_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            output: row.get("output"),
            error: row.get("error"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_tool_definition(&self, tool: ToolDefinition) -> Result<ToolDefinition, sqlx::Error> {
        let query = r#"
            INSERT INTO tools (id, name, description, version, executable, arguments, capabilities, is_system, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&tool.id)
            .bind(&tool.name)
            .bind(&tool.description)
            .bind(&tool.version)
            .bind(&tool.executable)
            .bind(&tool.arguments.join(","))
            .bind(&tool.capabilities.join(","))
            .bind(&tool.is_system)
            .bind(&tool.is_active)
            .bind(&tool.created_at)
            .bind(&tool.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ToolDefinition {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            version: row.get("version"),
            executable: row.get("executable"),
            arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            is_system: row.get("is_system"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_tool_definition(&self, id: &str) -> Result<ToolDefinition, sqlx::Error> {
        let query = r#"
            SELECT * FROM tools WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ToolDefinition {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            version: row.get("version"),
            executable: row.get("executable"),
            arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
            capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
            is_system: row.get("is_system"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_tools_by_capability(&self, capability: &str) -> Result<Vec<ToolDefinition>, sqlx::Error> {
        let query = r#"
            SELECT * FROM tools WHERE capabilities LIKE ?
        "#;
        
        let rows = sqlx::query(query)
            .bind(&format!("%{}%", capability))
            .fetch_all(&self.pool)
            .await?;
            
        let mut tools = Vec::new();
        for row in rows {
            tools.push(ToolDefinition {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                version: row.get("version"),
                executable: row.get("executable"),
                arguments: row.get::<String, _>("arguments").split(",").map(|s| s.to_string()).collect(),
                capabilities: row.get::<String, _>("capabilities").split(",").map(|s| s.to_string()).collect(),
                is_system: row.get("is_system"),
                is_active: row.get("is_active"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(tools)
    }

    pub async fn create_execution_history(&self, history: ExecutionHistory) -> Result<ExecutionHistory, sqlx::Error> {
        let query = r#"
            INSERT INTO execution_history (id, execution_id, workspace_id, project_id, tool_id, command, status, exit_code, duration, started_at, completed_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&history.id)
            .bind(&history.execution_id)
            .bind(&history.workspace_id)
            .bind(&history.project_id)
            .bind(&history.tool_id)
            .bind(&history.command)
            .bind(&history.status)
            .bind(&history.exit_code)
            .bind(&history.duration)
            .bind(&history.started_at)
            .bind(&history.completed_at)
            .bind(&history.created_at)
            .bind(&history.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ExecutionHistory {
            id: row.get("id"),
            execution_id: row.get("execution_id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            tool_id: row.get("tool_id"),
            command: row.get("command"),
            status: row.get("status"),
            exit_code: row.get("exit_code"),
            duration: row.get("duration"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_execution_history(&self, workspace_id: &str, project_id: Option<&str>, limit: i32) -> Result<Vec<ExecutionHistory>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM execution_history WHERE workspace_id = ?
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![workspace_id];
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        query.push_str(" ORDER BY created_at DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut history = Vec::new();
        for row in rows {
            history.push(ExecutionHistory {
                id: row.get("id"),
                execution_id: row.get("execution_id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                tool_id: row.get("tool_id"),
                command: row.get("command"),
                status: row.get("status"),
                exit_code: row.get("exit_code"),
                duration: row.get("duration"),
                started_at: row.get("started_at"),
                completed_at: row.get("completed_at"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(history)
    }

    pub async fn create_sandbox_configuration(&self, config: SandboxConfiguration) -> Result<SandboxConfiguration, sqlx::Error> {
        let query = r#"
            INSERT INTO sandbox_configurations (id, workspace_id, project_id, is_enabled, allowed_commands, allowed_paths, max_memory, max_cpu, timeout, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.id)
            .bind(&config.workspace_id)
            .bind(&config.project_id)
            .bind(&config.is_enabled)
            .bind(&config.allowed_commands.join(","))
            .bind(&config.allowed_paths.join(","))
            .bind(&config.max_memory)
            .bind(&config.max_cpu)
            .bind(&config.timeout)
            .bind(&config.created_at)
            .bind(&config.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SandboxConfiguration {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_enabled: row.get("is_enabled"),
            allowed_commands: row.get::<String, _>("allowed_commands").split(",").map(|s| s.to_string()).collect(),
            allowed_paths: row.get::<String, _>("allowed_paths").split(",").map(|s| s.to_string()).collect(),
            max_memory: row.get("max_memory"),
            max_cpu: row.get("max_cpu"),
            timeout: row.get("timeout"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_sandbox_configuration(&self, workspace_id: &str, project_id: Option<&str>) -> Result<SandboxConfiguration, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM sandbox_configurations WHERE workspace_id = ?
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![workspace_id];
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        let row = sqlx::query(&query)
            .bind(&binds)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SandboxConfiguration {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_enabled: row.get("is_enabled"),
            allowed_commands: row.get::<String, _>("allowed_commands").split(",").map(|s| s.to_string()).collect(),
            allowed_paths: row.get::<String, _>("allowed_paths").split(",").map(|s| s.to_string()).collect(),
            max_memory: row.get("max_memory"),
            max_cpu: row.get("max_cpu"),
            timeout: row.get("timeout"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_sandbox_configuration(&self, id: &str, config: SandboxConfiguration) -> Result<SandboxConfiguration, sqlx::Error> {
        let query = r#"
            UPDATE sandbox_configurations 
            SET workspace_id = ?, project_id = ?, is_enabled = ?, allowed_commands = ?, allowed_paths = ?, max_memory = ?, max_cpu = ?, timeout = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.workspace_id)
            .bind(&config.project_id)
            .bind(&config.is_enabled)
            .bind(&config.allowed_commands.join(","))
            .bind(&config.allowed_paths.join(","))
            .bind(&config.max_memory)
            .bind(&config.max_cpu)
            .bind(&config.timeout)
            .bind(&config.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SandboxConfiguration {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_enabled: row.get("is_enabled"),
            allowed_commands: row.get::<String, _>("allowed_commands").split(",").map(|s| s.to_string()).collect(),
            allowed_paths: row.get::<String, _>("allowed_paths").split(",").map(|s| s.to_string()).collect(),
            max_memory: row.get("max_memory"),
            max_cpu: row.get("max_cpu"),
            timeout: row.get("timeout"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}
