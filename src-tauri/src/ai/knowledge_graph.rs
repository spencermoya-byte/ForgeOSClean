use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::knowledge_graph::{KnowledgeGraphDatabase, GraphEntity, GraphRelationship, ContextualMetadata};

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphNode {
    pub id: String,
    pub node_type: String, // "workspace", "project", "resource", "ai_session", "workflow", "plugin", "agent"
    pub name: String,
    pub description: String,
    pub metadata: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphEdge {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub relationship_type: String, // "contains", "uses", "depends_on", "related_to", "references"
    pub weight: f32,
    pub metadata: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphContext {
    pub entities: Vec<GraphNode>,
    pub relationships: Vec<GraphEdge>,
    pub contextual_metadata: Vec<ContextualMetadata>,
    pub relevance_score: f32,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphQuery {
    pub entity_types: Vec<String>,
    pub relationship_types: Vec<String>,
    pub context_filters: serde_json::Value,
    pub limit: u32,
    pub offset: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphSearchRequest {
    pub query: String,
    pub context: Option<GraphContext>,
    pub filters: Option<GraphQuery>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphSearchResult {
    pub entities: Vec<GraphNode>,
    pub relationships: Vec<GraphEdge>,
    pub context: GraphContext,
    pub relevance_scores: Vec<f32>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphTraversalRequest {
    pub start_entity_id: String,
    pub relationship_types: Vec<String>,
    pub max_depth: u32,
    pub context: Option<GraphContext>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphTraversalResult {
    pub entities: Vec<GraphNode>,
    pub relationships: Vec<GraphEdge>,
    pub path: Vec<String>,
    pub context: GraphContext,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphUpdateRequest {
    pub entities: Vec<GraphNode>,
    pub relationships: Vec<GraphEdge>,
    pub context: Option<GraphContext>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GraphUpdateResponse {
    pub updated_entities: Vec<GraphNode>,
    pub updated_relationships: Vec<GraphEdge>,
    pub context: GraphContext,
}

#[tauri::command]
pub async fn search_graph(
    db: State<'_, sqlx::SqlitePool>,
    request: GraphSearchRequest,
) -> Result<GraphSearchResult, String> {
    let graph_db = KnowledgeGraphDatabase::new(db.inner().clone());
    
    // In a real implementation, this would perform a semantic search on the graph
    // For now, we'll return mock results
    
    let entities = vec![
        GraphNode {
            id: "entity_1".to_string(),
            node_type: "workspace".to_string(),
            name: "Main Workspace".to_string(),
            description: "Primary workspace for all projects".to_string(),
            metadata: serde_json::json!({"path": "/workspaces/main"}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
        GraphNode {
            id: "entity_2".to_string(),
            node_type: "project".to_string(),
            name: "AI Research".to_string(),
            description: "Research project for AI development".to_string(),
            metadata: serde_json::json!({"tags": ["ai", "research"]}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    ];
    
    let relationships = vec![
        GraphEdge {
            id: "edge_1".to_string(),
            source_id: "entity_1".to_string(),
            target_id: "entity_2".to_string(),
            relationship_type: "contains".to_string(),
            weight: 0.95,
            metadata: serde_json::json!({"created_by": "user_1"}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    ];
    
    let context = GraphContext {
        entities: entities.clone(),
        relationships: relationships.clone(),
        contextual_metadata: vec![],
        relevance_score: 0.85,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(GraphSearchResult {
        entities,
        relationships,
        context,
        relevance_scores: vec![0.95, 0.85],
    })
}

#[tauri::command]
pub async fn traverse_graph(
    db: State<'_, sqlx::SqlitePool>,
    request: GraphTraversalRequest,
) -> Result<GraphTraversalResult, String> {
    let graph_db = KnowledgeGraphDatabase::new(db.inner().clone());
    
    // In a real implementation, this would traverse the graph
    // For now, we'll return mock results
    
    let entities = vec![
        GraphNode {
            id: "entity_1".to_string(),
            node_type: "workspace".to_string(),
            name: "Main Workspace".to_string(),
            description: "Primary workspace for all projects".to_string(),
            metadata: serde_json::json!({"path": "/workspaces/main"}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        },
        GraphNode {
            id: "entity_2".to_string(),
            node_type: "project".to_string(),
            name: "AI Research".to_string(),
            description: "Research project for AI development".to_string(),
            metadata: serde_json::json!({"tags": ["ai", "research"]}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    ];
    
    let relationships = vec![
        GraphEdge {
            id: "edge_1".to_string(),
            source_id: "entity_1".to_string(),
            target_id: "entity_2".to_string(),
            relationship_type: "contains".to_string(),
            weight: 0.95,
            metadata: serde_json::json!({"created_by": "user_1"}),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    ];
    
    let context = GraphContext {
        entities: entities.clone(),
        relationships: relationships.clone(),
        contextual_metadata: vec![],
        relevance_score: 0.85,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(GraphTraversalResult {
        entities,
        relationships,
        path: vec!["entity_1".to_string(), "entity_2".to_string()],
        context,
    })
}

#[tauri::command]
pub async fn update_graph(
    db: State<'_, sqlx::SqlitePool>,
    request: GraphUpdateRequest,
) -> Result<GraphUpdateResponse, String> {
    let graph_db = KnowledgeGraphDatabase::new(db.inner().clone());
    
    // In a real implementation, this would update the graph
    // For now, we'll return mock results
    
    let updated_entities = request.entities;
    let updated_relationships = request.relationships;
    
    let context = GraphContext {
        entities: updated_entities.clone(),
        relationships: updated_relationships.clone(),
        contextual_metadata: vec![],
        relevance_score: 0.9,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(GraphUpdateResponse {
        updated_entities,
        updated_relationships,
        context,
    })
}
