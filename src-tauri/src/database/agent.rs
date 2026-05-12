use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub type_: String, // "local", "remote", "plugin"
    pub capabilities: String, // JSON array of capabilities
    pub is_active: bool,
    pub config: String, // JSON configuration
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct AgentCapability {
    pub id: String,
    pub agent_id: String,
    pub capability: String,
    pub is_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
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

#[derive(Debug, Clone)]
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

pub struct AgentDatabase {
    pool: SqlitePool,
}

impl AgentDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        AgentDatabase { pool }
    }

    pub async fn create_agent(&self, agent: Agent) -> Result<Agent, sqlx::Error> {
        let query = r#"
            INSERT INTO agents (id, name, description, type, capabilities, is_active, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&agent.id)
            .bind(&agent.name)
            .bind(&agent.description)
            .bind(&agent.type_)
            .bind(&agent.capabilities)
            .bind(&agent.is_active)
            .bind(&agent.config)
            .bind(&agent.created_at)
            .bind(&agent.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Agent {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            type_: row.get("type"),
            capabilities: row.get("capabilities"),
            is_active: row.get("is_active"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_agent(&self, id: &str) -> Result<Agent, sqlx::Error> {
        let query = r#"
            SELECT * FROM agents WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Agent {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            type_: row.get("type"),
            capabilities: row.get("capabilities"),
            is_active: row.get("is_active"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_agents(&self) -> Result<Vec<Agent>, sqlx::Error> {
        let query = r#"
            SELECT * FROM agents ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .fetch_all(&self.pool)
            .await?;
            
        let mut agents = Vec::new();
        for row in rows {
            agents.push(Agent {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                type_: row.get("type"),
                capabilities: row.get("capabilities"),
                is_active: row.get("is_active"),
                config: row.get("config"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(agents)
    }

    pub async fn update_agent(&self, id: &str, agent: Agent) -> Result<Agent, sqlx::Error> {
        let query = r#"
            UPDATE agents 
            SET name = ?, description = ?, type = ?, capabilities = ?, is_active = ?, config = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&agent.name)
            .bind(&agent.description)
            .bind(&agent.type_)
            .bind(&agent.capabilities)
            .bind(&agent.is_active)
            .bind(&agent.config)
            .bind(&agent.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Agent {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            type_: row.get("type"),
            capabilities: row.get("capabilities"),
            is_active: row.get("is_active"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_agent(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM agents WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn get_agent_capabilities(&self, agent_id: &str) -> Result<Vec<AgentCapability>, sqlx::Error> {
        let query = r#"
            SELECT * FROM agent_capabilities WHERE agent_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(agent_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut capabilities = Vec::new();
        for row in rows {
            capabilities.push(AgentCapability {
                id: row.get("id"),
                agent_id: row.get("agent_id"),
                capability: row.get("capability"),
                is_enabled: row.get("is_enabled"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(capabilities)
    }

    pub async fn create_agent_capability(&self, capability: AgentCapability) -> Result<AgentCapability, sqlx::Error> {
        let query = r#"
            INSERT INTO agent_capabilities (id, agent_id, capability, is_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&capability.id)
            .bind(&capability.agent_id)
            .bind(&capability.capability)
            .bind(&capability.is_enabled)
            .bind(&capability.created_at)
            .bind(&capability.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AgentCapability {
            id: row.get("id"),
            agent_id: row.get("agent_id"),
            capability: row.get("capability"),
            is_enabled: row.get("is_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_agent_capability(&self, id: &str, is_enabled: bool) -> Result<AgentCapability, sqlx::Error> {
        let query = r#"
            UPDATE agent_capabilities 
            SET is_enabled = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(is_enabled)
            .bind(chrono::Utc::now().to_rfc3339())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AgentCapability {
            id: row.get("id"),
            agent_id: row.get("agent_id"),
            capability: row.get("capability"),
            is_enabled: row.get("is_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_agent_execution(&self, execution: AgentExecution) -> Result<AgentExecution, sqlx::Error> {
        let query = r#"
            INSERT INTO agent_executions (id, agent_id, task_id, status, result, error_message, started_at, completed_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&execution.id)
            .bind(&execution.agent_id)
            .bind(&execution.task_id)
            .bind(&execution.status)
            .bind(&execution.result)
            .bind(&execution.error_message)
            .bind(&execution.started_at)
            .bind(&execution.completed_at)
            .bind(&execution.created_at)
            .bind(&execution.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AgentExecution {
            id: row.get("id"),
            agent_id: row.get("agent_id"),
            task_id: row.get("task_id"),
            status: row.get("status"),
            result: row.get("result"),
            error_message: row.get("error_message"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_agent_executions(&self, agent_id: &str) -> Result<Vec<AgentExecution>, sqlx::Error> {
        let query = r#"
            SELECT * FROM agent_executions WHERE agent_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(agent_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut executions = Vec::new();
        for row in rows {
            executions.push(AgentExecution {
                id: row.get("id"),
                agent_id: row.get("agent_id"),
                task_id: row.get("task_id"),
                status: row.get("status"),
                result: row.get("result"),
                error_message: row.get("error_message"),
                started_at: row.get("started_at"),
                completed_at: row.get("completed_at"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(executions)
    }

    pub async fn create_agent_task(&self, task: AgentTask) -> Result<AgentTask, sqlx::Error> {
        let query = r#"
            INSERT INTO agent_tasks (id, agent_id, name, description, context, priority, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&task.id)
            .bind(&task.agent_id)
            .bind(&task.name)
            .bind(&task.description)
            .bind(&task.context)
            .bind(&task.priority)
            .bind(&task.status)
            .bind(&task.created_at)
            .bind(&task.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(AgentTask {
            id: row.get("id"),
            agent_id: row.get("agent_id"),
            name: row.get("name"),
            description: row.get("description"),
            context: row.get("context"),
            priority: row.get("priority"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_agent_tasks(&self, agent_id: &str) -> Result<Vec<AgentTask>, sqlx::Error> {
        let query = r#"
            SELECT * FROM agent_tasks WHERE agent_id = ? ORDER BY priority DESC, created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(agent_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut tasks = Vec::new();
        for row in rows {
            tasks.push(AgentTask {
                id: row.get("id"),
                agent_id: row.get("agent_id"),
                name: row.get("name"),
                description: row.get("description"),
                context: row.get("context"),
                priority: row.get("priority"),
                status: row.get("status"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(tasks)
    }
}
