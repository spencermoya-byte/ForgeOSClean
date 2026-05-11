use sqlx::{SqlitePool, Row};
use serde::{Deserialize, Serialize};

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

pub struct WorkflowDatabase {
    pool: SqlitePool,
}

impl WorkflowDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        WorkflowDatabase { pool }
    }

    pub async fn create_workflow(&self, workflow: Workflow) -> Result<Workflow, sqlx::Error> {
        let query = r#"
            INSERT INTO workflows (id, name, description, workspace_id, project_id, is_active, trigger_type, trigger_config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(workflow.id)
            .bind(workflow.name)
            .bind(workflow.description)
            .bind(workflow.workspace_id)
            .bind(workflow.project_id)
            .bind(workflow.is_active)
            .bind(workflow.trigger_type)
            .bind(workflow.trigger_config)
            .bind(workflow.created_at)
            .bind(workflow.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Workflow {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_active: row.get("is_active"),
            trigger_type: row.get("trigger_type"),
            trigger_config: row.get("trigger_config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_workflow(&self, id: &str) -> Result<Workflow, sqlx::Error> {
        let query = r#"
            SELECT * FROM workflows WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Workflow {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_active: row.get("is_active"),
            trigger_type: row.get("trigger_type"),
            trigger_config: row.get("trigger_config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_workflows(&self, workspace_id: Option<&str>, project_id: Option<&str>) -> Result<Vec<Workflow>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM workflows WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let mut query_builder = sqlx::query(&query);
        for bind in binds {
            query_builder = query_builder.bind(bind);
        }
        
        let rows = query_builder.fetch_all(&self.pool).await?;
        
        let mut workflows = Vec::new();
        for row in rows {
            workflows.push(Workflow {
                id: row.get("id"),
                name: row.get("name"),
                description: row.get("description"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                is_active: row.get("is_active"),
                trigger_type: row.get("trigger_type"),
                trigger_config: row.get("trigger_config"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(workflows)
    }

    pub async fn update_workflow(&self, id: &str, workflow: Workflow) -> Result<Workflow, sqlx::Error> {
        let query = r#"
            UPDATE workflows 
            SET name = ?, description = ?, workspace_id = ?, project_id = ?, is_active = ?, trigger_type = ?, trigger_config = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(workflow.name)
            .bind(workflow.description)
            .bind(workflow.workspace_id)
            .bind(workflow.project_id)
            .bind(workflow.is_active)
            .bind(workflow.trigger_type)
            .bind(workflow.trigger_config)
            .bind(workflow.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Workflow {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            is_active: row.get("is_active"),
            trigger_type: row.get("trigger_type"),
            trigger_config: row.get("trigger_config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_workflow(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM workflows WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_workflow_step(&self, step: WorkflowStep) -> Result<WorkflowStep, sqlx::Error> {
        let query = r#"
            INSERT INTO workflow_steps (id, workflow_id, name, description, step_type, config, position, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(step.id)
            .bind(step.workflow_id)
            .bind(step.name)
            .bind(step.description)
            .bind(step.step_type)
            .bind(step.config)
            .bind(step.position)
            .bind(step.is_active)
            .bind(step.created_at)
            .bind(step.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(WorkflowStep {
            id: row.get("id"),
            workflow_id: row.get("workflow_id"),
            name: row.get("name"),
            description: row.get("description"),
            step_type: row.get("step_type"),
            config: row.get("config"),
            position: row.get("position"),
            is_active: row.get("is_active"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_workflow_steps(&self, workflow_id: &str) -> Result<Vec<WorkflowStep>, sqlx::Error> {
        let query = r#"
            SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY position ASC
        "#;
        
        let rows = sqlx::query(query)
            .bind(workflow_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut steps = Vec::new();
        for row in rows {
            steps.push(WorkflowStep {
                id: row.get("id"),
                workflow_id: row.get("workflow_id"),
                name: row.get("name"),
                description: row.get("description"),
                step_type: row.get("step_type"),
                config: row.get("config"),
                position: row.get("position"),
                is_active: row.get("is_active"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(steps)
    }

    pub async fn create_workflow_execution(&self, execution: WorkflowExecution) -> Result<WorkflowExecution, sqlx::Error> {
        let query = r#"
            INSERT INTO workflow_executions (id, workflow_id, status, started_at, completed_at, error_message, result, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(execution.id)
            .bind(execution.workflow_id)
            .bind(execution.status)
            .bind(execution.started_at)
            .bind(execution.completed_at)
            .bind(execution.error_message)
            .bind(execution.result)
            .bind(execution.created_at)
            .bind(execution.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(WorkflowExecution {
            id: row.get("id"),
            workflow_id: row.get("workflow_id"),
            status: row.get("status"),
            started_at: row.get("started_at"),
            completed_at: row.get("completed_at"),
            error_message: row.get("error_message"),
            result: row.get("result"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_workflow_executions(&self, workflow_id: &str) -> Result<Vec<WorkflowExecution>, sqlx::Error> {
        let query = r#"
            SELECT * FROM workflow_executions WHERE workflow_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(workflow_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut executions = Vec::new();
        for row in rows {
            executions.push(WorkflowExecution {
                id: row.get("id"),
                workflow_id: row.get("workflow_id"),
                status: row.get("status"),
                started_at: row.get("started_at"),
                completed_at: row.get("completed_at"),
                error_message: row.get("error_message"),
                result: row.get("result"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(executions)
    }
}
