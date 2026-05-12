use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::observability::{ObservabilityDatabase, TelemetryEvent, SystemHealthMetric, SubsystemHealth, DiagnosticReport, HealthAggregation, MonitoringConfiguration};

#[derive(Serialize, Deserialize, Clone)]
pub struct TelemetryEventPayload {
    pub event_type: String,
    pub source: String,
    pub level: String,
    pub message: String,
    pub details: serde_json::Value,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SystemHealthMetricPayload {
    pub metric_type: String,
    pub value: f64,
    pub unit: String,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SubsystemHealthPayload {
    pub subsystem: String,
    pub status: String,
    pub health_score: f32,
    pub details: serde_json::Value,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticReportPayload {
    pub report_type: String,
    pub source: String,
    pub status: String,
    pub severity: String,
    pub description: String,
    pub details: serde_json::Value,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct HealthAggregationPayload {
    pub aggregation_type: String,
    pub period: String,
    pub metrics: serde_json::Value,
    pub workspace_id: Option<String>,
    pub project_id: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MonitoringConfigurationPayload {
    pub subsystem: String,
    pub is_enabled: bool,
    pub monitoring_level: String,
    pub alert_threshold: f32,
    pub alert_enabled: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct HealthStatusResponse {
    pub status: String,
    pub health_score: f32,
    pub subsystems: Vec<SubsystemHealth>,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TelemetryEventResponse {
    pub id: String,
    pub event_type: String,
    pub source: String,
    pub level: String,
    pub message: String,
    pub timestamp: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SystemHealthMetricsResponse {
    pub metrics: Vec<SystemHealthMetric>,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticReportResponse {
    pub id: String,
    pub report_type: String,
    pub source: String,
    pub status: String,
    pub severity: String,
    pub description: String,
    pub timestamp: String,
    pub created_at: String,
}

#[tauri::command]
pub async fn log_telemetry_event(
    db: State<'_, sqlx::SqlitePool>,
    event: TelemetryEventPayload,
) -> Result<TelemetryEventResponse, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let telemetry_event = TelemetryEvent {
        id: uuid::Uuid::new_v4().to_string(),
        event_type: event.event_type,
        source: event.source,
        level: event.level,
        message: event.message,
        details: serde_json::to_string(&event.details).unwrap_or_default(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        workspace_id: event.workspace_id,
        project_id: event.project_id,
        user_id: event.user_id,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    let saved_event = observability_db.create_telemetry_event(telemetry_event)
        .await
        .map_err(|e| format!("Failed to create telemetry event: {}", e))?;
    
    Ok(TelemetryEventResponse {
        id: saved_event.id,
        event_type: saved_event.event_type,
        source: saved_event.source,
        level: saved_event.level,
        message: saved_event.message,
        timestamp: saved_event.timestamp,
        created_at: saved_event.created_at,
    })
}

#[tauri::command]
pub async fn get_system_health_metrics(
    db: State<'_, sqlx::SqlitePool>,
    metric_type: Option<String>,
    workspace_id: Option<String>,
    project_id: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    limit: Option<u32>,
) -> Result<SystemHealthMetricsResponse, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let metrics = observability_db.get_system_health_metrics(
        metric_type.as_deref(),
        workspace_id.as_deref(),
        project_id.as_deref(),
        start_time.as_deref(),
        end_time.as_deref(),
        limit.unwrap_or(50) as i32
    ).await
    .map_err(|e| format!("Failed to get system health metrics: {}", e))?;
    
    Ok(SystemHealthMetricsResponse {
        metrics,
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn get_subsystem_health(
    db: State<'_, sqlx::SqlitePool>,
    subsystem: Option<String>,
    workspace_id: Option<String>,
    project_id: Option<String>,
) -> Result<Vec<SubsystemHealth>, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let healths = observability_db.get_subsystem_health(
        subsystem.as_deref(),
        workspace_id.as_deref(),
        project_id.as_deref()
    ).await
    .map_err(|e| format!("Failed to get subsystem health: {}", e))?;
    
    Ok(healths)
}

#[tauri::command]
pub async fn get_telemetry_events(
    db: State<'_, sqlx::SqlitePool>,
    event_type: Option<String>,
    source: Option<String>,
    level: Option<String>,
    workspace_id: Option<String>,
    project_id: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<TelemetryEvent>, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let events = observability_db.get_telemetry_events(
        event_type.as_deref(),
        source.as_deref(),
        level.as_deref(),
        workspace_id.as_deref(),
        project_id.as_deref(),
        start_time.as_deref(),
        end_time.as_deref(),
        limit.unwrap_or(50) as i32
    ).await
    .map_err(|e| format!("Failed to get telemetry events: {}", e))?;
    
    Ok(events)
}

#[tauri::command]
pub async fn get_diagnostic_reports(
    db: State<'_, sqlx::SqlitePool>,
    report_type: Option<String>,
    source: Option<String>,
    status: Option<String>,
    workspace_id: Option<String>,
    project_id: Option<String>,
    severity: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<DiagnosticReport>, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let reports = observability_db.get_diagnostic_reports(
        report_type.as_deref(),
        source.as_deref(),
        status.as_deref(),
        workspace_id.as_deref(),
        project_id.as_deref(),
        severity.as_deref(),
        start_time.as_deref(),
        end_time.as_deref(),
        limit.unwrap_or(50) as i32
    ).await
    .map_err(|e| format!("Failed to get diagnostic reports: {}", e))?;
    
    Ok(reports)
}

#[tauri::command]
pub async fn get_health_aggregations(
    db: State<'_, sqlx::SqlitePool>,
    aggregation_type: Option<String>,
    period: Option<String>,
    workspace_id: Option<String>,
    project_id: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<HealthAggregation>, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let aggregations = observability_db.get_health_aggregations(
        aggregation_type.as_deref(),
        period.as_deref(),
        workspace_id.as_deref(),
        project_id.as_deref(),
        start_time.as_deref(),
        end_time.as_deref(),
        limit.unwrap_or(50) as i32
    ).await
    .map_err(|e| format!("Failed to get health aggregations: {}", e))?;
    
    Ok(aggregations)
}

#[tauri::command]
pub async fn get_monitoring_configuration(
    db: State<'_, sqlx::SqlitePool>,
    subsystem: String,
) -> Result<MonitoringConfiguration, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let config = observability_db.get_monitoring_configuration(&subsystem)
        .await
        .map_err(|e| format!("Failed to get monitoring configuration: {}", e))?;
    
    Ok(config)
}

#[tauri::command]
pub async fn update_monitoring_configuration(
    db: State<'_, sqlx::SqlitePool>,
    subsystem: String,
    is_enabled: bool,
    monitoring_level: String,
    alert_threshold: f32,
    alert_enabled: bool,
) -> Result<MonitoringConfiguration, String> {
    let observability_db = ObservabilityDatabase::new(db.inner().clone());
    
    let config = MonitoringConfiguration {
        id: uuid::Uuid::new_v4().to_string(),
        subsystem,
        is_enabled,
        monitoring_level,
        alert_threshold,
        alert_enabled,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    
    let saved_config = observability_db.create_monitoring_configuration(config)
        .await
        .map_err(|e| format!("Failed to create monitoring configuration: {}", e))?;
    
    Ok(saved_config)
}
