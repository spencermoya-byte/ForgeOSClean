use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct TelemetryEvent {
    pub id: String,
    pub event_type: String, // "system_health", "execution", "indexing", "sync", "ai", "workflow"
    pub source: String, // "filesystem", "execution", "indexing", "sync", "ai", "workflow", "plugin"
    pub level: String, // "info", "warning", "error", "critical"
    pub message: String,
    pub details: String, // JSON string
    pub timestamp: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct SystemHealthMetric {
    pub id: String,
    pub metric_type: String, // "cpu", "memory", "disk", "network", "process"
    pub value: f64,
    pub unit: String,
    pub timestamp: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct SubsystemHealth {
    pub id: String,
    pub subsystem: String, // "filesystem", "execution", "indexing", "sync", "ai", "workflow", "plugin"
    pub status: String, // "healthy", "warning", "critical", "offline"
    pub health_score: f32,
    pub last_updated: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub details: String, // JSON string
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct DiagnosticReport {
    pub id: String,
    pub report_type: String, // "execution", "indexing", "sync", "ai", "workflow"
    pub source: String,
    pub status: String, // "resolved", "in_progress", "pending", "failed"
    pub severity: String, // "low", "medium", "high", "critical"
    pub description: String,
    pub details: String, // JSON string
    pub timestamp: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct HealthAggregation {
    pub id: String,
    pub aggregation_type: String, // "system", "workspace", "project", "user"
    pub period: String, // "hourly", "daily", "weekly", "monthly"
    pub metrics: String, // JSON string with aggregated metrics
    pub timestamp: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct MonitoringConfiguration {
    pub id: String,
    pub subsystem: String, // "filesystem", "execution", "indexing", "sync", "ai", "workflow", "plugin"
    pub is_enabled: bool,
    pub monitoring_level: String, // "basic", "detailed", "full"
    pub alert_threshold: f32,
    pub alert_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub struct ObservabilityDatabase {
    pool: SqlitePool,
}

impl ObservabilityDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        ObservabilityDatabase { pool }
    }

    pub async fn create_telemetry_event(&self, event: TelemetryEvent) -> Result<TelemetryEvent, sqlx::Error> {
        let query = r#"
            INSERT INTO telemetry_events (id, event_type, source, level, message, details, timestamp, workspace_id, project_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&event.id)
            .bind(&event.event_type)
            .bind(&event.source)
            .bind(&event.level)
            .bind(&event.message)
            .bind(&event.details)
            .bind(&event.timestamp)
            .bind(&event.workspace_id)
            .bind(&event.project_id)
            .bind(&event.user_id)
            .bind(&event.created_at)
            .bind(&event.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(TelemetryEvent {
            id: row.get("id"),
            event_type: row.get("event_type"),
            source: row.get("source"),
            level: row.get("level"),
            message: row.get("message"),
            details: row.get("details"),
            timestamp: row.get("timestamp"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            user_id: row.get("user_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_telemetry_events(&self, 
        event_type: Option<&str>,
        source: Option<&str>,
        level: Option<&str>,
        workspace_id: Option<&str>,
        project_id: Option<&str>,
        start_time: Option<&str>,
        end_time: Option<&str>,
        limit: i32
    ) -> Result<Vec<TelemetryEvent>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM telemetry_events WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(event_type) = event_type {
            query.push_str(" AND event_type = ?");
            binds.push(event_type);
        }
        
        if let Some(source) = source {
            query.push_str(" AND source = ?");
            binds.push(source);
        }
        
        if let Some(level) = level {
            query.push_str(" AND level = ?");
            binds.push(level);
        }
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        if let Some(start_time) = start_time {
            query.push_str(" AND timestamp >= ?");
            binds.push(start_time);
        }
        
        if let Some(end_time) = end_time {
            query.push_str(" AND timestamp <= ?");
            binds.push(end_time);
        }
        
        query.push_str(" ORDER BY timestamp DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut events = Vec::new();
        for row in rows {
            events.push(TelemetryEvent {
                id: row.get("id"),
                event_type: row.get("event_type"),
                source: row.get("source"),
                level: row.get("level"),
                message: row.get("message"),
                details: row.get("details"),
                timestamp: row.get("timestamp"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                user_id: row.get("user_id"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(events)
    }

    pub async fn create_system_health_metric(&self, metric: SystemHealthMetric) -> Result<SystemHealthMetric, sqlx::Error> {
        let query = r#"
            INSERT INTO system_health_metrics (id, metric_type, value, unit, timestamp, workspace_id, project_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metric.id)
            .bind(&metric.metric_type)
            .bind(&metric.value)
            .bind(&metric.unit)
            .bind(&metric.timestamp)
            .bind(&metric.workspace_id)
            .bind(&metric.project_id)
            .bind(&metric.created_at)
            .bind(&metric.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SystemHealthMetric {
            id: row.get("id"),
            metric_type: row.get("metric_type"),
            value: row.get("value"),
            unit: row.get("unit"),
            timestamp: row.get("timestamp"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_system_health_metrics(&self, 
        metric_type: Option<&str>,
        workspace_id: Option<&str>,
        project_id: Option<&str>,
        start_time: Option<&str>,
        end_time: Option<&str>,
        limit: i32
    ) -> Result<Vec<SystemHealthMetric>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM system_health_metrics WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(metric_type) = metric_type {
            query.push_str(" AND metric_type = ?");
            binds.push(metric_type);
        }
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        if let Some(start_time) = start_time {
            query.push_str(" AND timestamp >= ?");
            binds.push(start_time);
        }
        
        if let Some(end_time) = end_time {
            query.push_str(" AND timestamp <= ?");
            binds.push(end_time);
        }
        
        query.push_str(" ORDER BY timestamp DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut metrics = Vec::new();
        for row in rows {
            metrics.push(SystemHealthMetric {
                id: row.get("id"),
                metric_type: row.get("metric_type"),
                value: row.get("value"),
                unit: row.get("unit"),
                timestamp: row.get("timestamp"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(metrics)
    }

    pub async fn create_subsystem_health(&self, health: SubsystemHealth) -> Result<SubsystemHealth, sqlx::Error> {
        let query = r#"
            INSERT INTO subsystem_health (id, subsystem, status, health_score, last_updated, workspace_id, project_id, details, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&health.id)
            .bind(&health.subsystem)
            .bind(&health.status)
            .bind(&health.health_score)
            .bind(&health.last_updated)
            .bind(&health.workspace_id)
            .bind(&health.project_id)
            .bind(&health.details)
            .bind(&health.created_at)
            .bind(&health.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(SubsystemHealth {
            id: row.get("id"),
            subsystem: row.get("subsystem"),
            status: row.get("status"),
            health_score: row.get("health_score"),
            last_updated: row.get("last_updated"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            details: row.get("details"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_subsystem_health(&self, 
        subsystem: Option<&str>,
        workspace_id: Option<&str>,
        project_id: Option<&str>
    ) -> Result<Vec<SubsystemHealth>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM subsystem_health WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(subsystem) = subsystem {
            query.push_str(" AND subsystem = ?");
            binds.push(subsystem);
        }
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        query.push_str(" ORDER BY last_updated DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut healths = Vec::new();
        for row in rows {
            healths.push(SubsystemHealth {
                id: row.get("id"),
                subsystem: row.get("subsystem"),
                status: row.get("status"),
                health_score: row.get("health_score"),
                last_updated: row.get("last_updated"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                details: row.get("details"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(healths)
    }

    pub async fn create_diagnostic_report(&self, report: DiagnosticReport) -> Result<DiagnosticReport, sqlx::Error> {
        let query = r#"
            INSERT INTO diagnostic_reports (id, report_type, source, status, severity, description, details, timestamp, workspace_id, project_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&report.id)
            .bind(&report.report_type)
            .bind(&report.source)
            .bind(&report.status)
            .bind(&report.severity)
            .bind(&report.description)
            .bind(&report.details)
            .bind(&report.timestamp)
            .bind(&report.workspace_id)
            .bind(&report.project_id)
            .bind(&report.user_id)
            .bind(&report.created_at)
            .bind(&report.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(DiagnosticReport {
            id: row.get("id"),
            report_type: row.get("report_type"),
            source: row.get("source"),
            status: row.get("status"),
            severity: row.get("severity"),
            description: row.get("description"),
            details: row.get("details"),
            timestamp: row.get("timestamp"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            user_id: row.get("user_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_diagnostic_reports(&self, 
        report_type: Option<&str>,
        source: Option<&str>,
        status: Option<&str>,
        workspace_id: Option<&str>,
        project_id: Option<&str>,
        severity: Option<&str>,
        start_time: Option<&str>,
        end_time: Option<&str>,
        limit: i32
    ) -> Result<Vec<DiagnosticReport>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM diagnostic_reports WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(report_type) = report_type {
            query.push_str(" AND report_type = ?");
            binds.push(report_type);
        }
        
        if let Some(source) = source {
            query.push_str(" AND source = ?");
            binds.push(source);
        }
        
        if let Some(status) = status {
            query.push_str(" AND status = ?");
            binds.push(status);
        }
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        if let Some(severity) = severity {
            query.push_str(" AND severity = ?");
            binds.push(severity);
        }
        
        if let Some(start_time) = start_time {
            query.push_str(" AND timestamp >= ?");
            binds.push(start_time);
        }
        
        if let Some(end_time) = end_time {
            query.push_str(" AND timestamp <= ?");
            binds.push(end_time);
        }
        
        query.push_str(" ORDER BY timestamp DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut reports = Vec::new();
        for row in rows {
            reports.push(DiagnosticReport {
                id: row.get("id"),
                report_type: row.get("report_type"),
                source: row.get("source"),
                status: row.get("status"),
                severity: row.get("severity"),
                description: row.get("description"),
                details: row.get("details"),
                timestamp: row.get("timestamp"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                user_id: row.get("user_id"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(reports)
    }

    pub async fn create_health_aggregation(&self, aggregation: HealthAggregation) -> Result<HealthAggregation, sqlx::Error> {
        let query = r#"
            INSERT INTO health_aggregations (id, aggregation_type, period, metrics, timestamp, workspace_id, project_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&aggregation.id)
            .bind(&aggregation.aggregation_type)
            .bind(&aggregation.period)
            .bind(&aggregation.metrics)
            .bind(&aggregation.timestamp)
            .bind(&aggregation.workspace_id)
            .bind(&aggregation.project_id)
            .bind(&aggregation.user_id)
            .bind(&aggregation.created_at)
            .bind(&aggregation.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(HealthAggregation {
            id: row.get("id"),
            aggregation_type: row.get("aggregation_type"),
            period: row.get("period"),
            metrics: row.get("metrics"),
            timestamp: row.get("timestamp"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            user_id: row.get("user_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_health_aggregations(&self, 
        aggregation_type: Option<&str>,
        period: Option<&str>,
        workspace_id: Option<&str>,
        project_id: Option<&str>,
        start_time: Option<&str>,
        end_time: Option<&str>,
        limit: i32
    ) -> Result<Vec<HealthAggregation>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM health_aggregations WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(aggregation_type) = aggregation_type {
            query.push_str(" AND aggregation_type = ?");
            binds.push(aggregation_type);
        }
        
        if let Some(period) = period {
            query.push_str(" AND period = ?");
            binds.push(period);
        }
        
        if let Some(workspace_id) = workspace_id {
            query.push_str(" AND workspace_id = ?");
            binds.push(workspace_id);
        }
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        if let Some(start_time) = start_time {
            query.push_str(" AND timestamp >= ?");
            binds.push(start_time);
        }
        
        if let Some(end_time) = end_time {
            query.push_str(" AND timestamp <= ?");
            binds.push(end_time);
        }
        
        query.push_str(" ORDER BY timestamp DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut aggregations = Vec::new();
        for row in rows {
            aggregations.push(HealthAggregation {
                id: row.get("id"),
                aggregation_type: row.get("aggregation_type"),
                period: row.get("period"),
                metrics: row.get("metrics"),
                timestamp: row.get("timestamp"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                user_id: row.get("user_id"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(aggregations)
    }

    pub async fn create_monitoring_configuration(&self, config: MonitoringConfiguration) -> Result<MonitoringConfiguration, sqlx::Error> {
        let query = r#"
            INSERT INTO monitoring_configurations (id, subsystem, is_enabled, monitoring_level, alert_threshold, alert_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.id)
            .bind(&config.subsystem)
            .bind(&config.is_enabled)
            .bind(&config.monitoring_level)
            .bind(&config.alert_threshold)
            .bind(&config.alert_enabled)
            .bind(&config.created_at)
            .bind(&config.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(MonitoringConfiguration {
            id: row.get("id"),
            subsystem: row.get("subsystem"),
            is_enabled: row.get("is_enabled"),
            monitoring_level: row.get("monitoring_level"),
            alert_threshold: row.get("alert_threshold"),
            alert_enabled: row.get("alert_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_monitoring_configuration(&self, subsystem: &str) -> Result<MonitoringConfiguration, sqlx::Error> {
        let query = r#"
            SELECT * FROM monitoring_configurations WHERE subsystem = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(subsystem)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(MonitoringConfiguration {
            id: row.get("id"),
            subsystem: row.get("subsystem"),
            is_enabled: row.get("is_enabled"),
            monitoring_level: row.get("monitoring_level"),
            alert_threshold: row.get("alert_threshold"),
            alert_enabled: row.get("alert_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_monitoring_configuration(&self, id: &str, config: MonitoringConfiguration) -> Result<MonitoringConfiguration, sqlx::Error> {
        let query = r#"
            UPDATE monitoring_configurations 
            SET subsystem = ?, is_enabled = ?, monitoring_level = ?, alert_threshold = ?, alert_enabled = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&config.subsystem)
            .bind(&config.is_enabled)
            .bind(&config.monitoring_level)
            .bind(&config.alert_threshold)
            .bind(&config.alert_enabled)
            .bind(&config.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(MonitoringConfiguration {
            id: row.get("id"),
            subsystem: row.get("subsystem"),
            is_enabled: row.get("is_enabled"),
            monitoring_level: row.get("monitoring_level"),
            alert_threshold: row.get("alert_threshold"),
            alert_enabled: row.get("alert_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}
