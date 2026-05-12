use sqlx::{SqlitePool, Row};

#[derive(Debug, Clone)]
pub struct IndexedFile {
    pub id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub path: String,
    pub name: String,
    pub size: u64,
    pub file_type: String,
    pub created_at: String,
    pub modified_at: String,
    pub metadata: String, // JSON string
}

#[derive(Debug, Clone)]
pub struct ProjectMetadata {
    pub id: String,
    pub project_id: String,
    pub file_count: u32,
    pub total_size: u64,
    pub last_indexed: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct FileRelationship {
    pub id: String,
    pub source_file_id: String,
    pub target_file_id: String,
    pub relationship_type: String, // "depends_on", "references", "contains", "related_to"
    pub weight: f32,
    pub created_at: String,
}

#[derive(Debug, Clone)]
pub struct IndexingStatus {
    pub id: String,
    pub workspace_id: String,
    pub project_id: Option<String>,
    pub status: String, // "idle", "scanning", "indexing", "completed", "failed"
    pub progress: f32,
    pub total_files: u32,
    pub processed_files: u32,
    pub last_updated: String,
    pub error_message: Option<String>,
}

// Code intelligence specific structures
#[derive(Debug, Clone)]
pub struct CodeSymbol {
    pub id: String,
    pub file_id: String,
    pub name: String,
    pub symbol_type: String, // "function", "class", "method", "variable", "constant", "module"
    pub start_line: u32,
    pub end_line: u32,
    pub signature: String,
    pub documentation: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct CodeRelationship {
    pub id: String,
    pub source_symbol_id: String,
    pub target_symbol_id: String,
    pub relationship_type: String, // "calls", "uses", "inherits", "imports", "references"
    pub weight: f32,
    pub created_at: String,
}

#[derive(Debug, Clone)]
pub struct CodeAnalysis {
    pub id: String,
    pub file_id: String,
    pub project_id: String,
    pub analysis_type: String, // "syntax", "semantic", "dependency", "complexity"
    pub result: String, // JSON string with analysis results
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct ProjectCodeIntelligence {
    pub id: String,
    pub project_id: String,
    pub symbol_count: u32,
    pub file_count: u32,
    pub average_complexity: f32,
    pub last_analyzed: String,
    pub created_at: String,
    pub updated_at: String,
}

pub struct FilesystemDatabase {
    pool: SqlitePool,
}

impl FilesystemDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        FilesystemDatabase { pool }
    }

    // Existing methods remain unchanged...
    
    pub async fn create_indexed_file(&self, file: IndexedFile) -> Result<IndexedFile, sqlx::Error> {
        let query = r#"
            INSERT INTO indexed_files (id, workspace_id, project_id, path, name, size, file_type, created_at, modified_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&file.id)
            .bind(&file.workspace_id)
            .bind(&file.project_id)
            .bind(&file.path)
            .bind(&file.name)
            .bind(&file.size)
            .bind(&file.file_type)
            .bind(&file.created_at)
            .bind(&file.modified_at)
            .bind(&file.metadata)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(IndexedFile {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            path: row.get("path"),
            name: row.get("name"),
            size: row.get("size"),
            file_type: row.get("file_type"),
            created_at: row.get("created_at"),
            modified_at: row.get("modified_at"),
            metadata: row.get("metadata"),
        })
    }

    pub async fn get_indexed_file(&self, id: &str) -> Result<IndexedFile, sqlx::Error> {
        let query = r#"
            SELECT * FROM indexed_files WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(IndexedFile {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            path: row.get("path"),
            name: row.get("name"),
            size: row.get("size"),
            file_type: row.get("file_type"),
            created_at: row.get("created_at"),
            modified_at: row.get("modified_at"),
            metadata: row.get("metadata"),
        })
    }

    pub async fn get_indexed_files(&self, workspace_id: &str, project_id: Option<&str>) -> Result<Vec<IndexedFile>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM indexed_files WHERE workspace_id = ?
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![workspace_id];
        
        if let Some(project_id) = project_id {
            query.push_str(" AND project_id = ?");
            binds.push(project_id);
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut files = Vec::new();
        for row in rows {
            files.push(IndexedFile {
                id: row.get("id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                path: row.get("path"),
                name: row.get("name"),
                size: row.get("size"),
                file_type: row.get("file_type"),
                created_at: row.get("created_at"),
                modified_at: row.get("modified_at"),
                metadata: row.get("metadata"),
            });
        }
        
        Ok(files)
    }

    pub async fn update_indexed_file(&self, id: &str, file: IndexedFile) -> Result<IndexedFile, sqlx::Error> {
        let query = r#"
            UPDATE indexed_files 
            SET workspace_id = ?, project_id = ?, path = ?, name = ?, size = ?, file_type = ?, created_at = ?, modified_at = ?, metadata = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&file.workspace_id)
            .bind(&file.project_id)
            .bind(&file.path)
            .bind(&file.name)
            .bind(&file.size)
            .bind(&file.file_type)
            .bind(&file.created_at)
            .bind(&file.modified_at)
            .bind(&file.metadata)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(IndexedFile {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            path: row.get("path"),
            name: row.get("name"),
            size: row.get("size"),
            file_type: row.get("file_type"),
            created_at: row.get("created_at"),
            modified_at: row.get("modified_at"),
            metadata: row.get("metadata"),
        })
    }

    pub async fn delete_indexed_file(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM indexed_files WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_project_metadata(&self, metadata: ProjectMetadata) -> Result<ProjectMetadata, sqlx::Error> {
        let query = r#"
            INSERT INTO project_metadata (id, project_id, file_count, total_size, last_indexed, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metadata.id)
            .bind(&metadata.project_id)
            .bind(&metadata.file_count)
            .bind(&metadata.total_size)
            .bind(&metadata.last_indexed)
            .bind(&metadata.created_at)
            .bind(&metadata.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ProjectMetadata {
            id: row.get("id"),
            project_id: row.get("project_id"),
            file_count: row.get("file_count"),
            total_size: row.get("total_size"),
            last_indexed: row.get("last_indexed"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_project_metadata(&self, project_id: &str) -> Result<ProjectMetadata, sqlx::Error> {
        let query = r#"
            SELECT * FROM project_metadata WHERE project_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(project_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ProjectMetadata {
            id: row.get("id"),
            project_id: row.get("project_id"),
            file_count: row.get("file_count"),
            total_size: row.get("total_size"),
            last_indexed: row.get("last_indexed"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_project_metadata(&self, project_id: &str, metadata: ProjectMetadata) -> Result<ProjectMetadata, sqlx::Error> {
        let query = r#"
            UPDATE project_metadata 
            SET file_count = ?, total_size = ?, last_indexed = ?, updated_at = ?
            WHERE project_id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&metadata.file_count)
            .bind(&metadata.total_size)
            .bind(&metadata.last_indexed)
            .bind(&metadata.updated_at)
            .bind(project_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ProjectMetadata {
            id: row.get("id"),
            project_id: row.get("project_id"),
            file_count: row.get("file_count"),
            total_size: row.get("total_size"),
            last_indexed: row.get("last_indexed"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_file_relationship(&self, relationship: FileRelationship) -> Result<FileRelationship, sqlx::Error> {
        let query = r#"
            INSERT INTO file_relationships (id, source_file_id, target_file_id, relationship_type, weight, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&relationship.id)
            .bind(&relationship.source_file_id)
            .bind(&relationship.target_file_id)
            .bind(&relationship.relationship_type)
            .bind(&relationship.weight)
            .bind(&relationship.created_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(FileRelationship {
            id: row.get("id"),
            source_file_id: row.get("source_file_id"),
            target_file_id: row.get("target_file_id"),
            relationship_type: row.get("relationship_type"),
            weight: row.get("weight"),
            created_at: row.get("created_at"),
        })
    }

    pub async fn get_file_relationships(&self, source_file_id: Option<&str>, target_file_id: Option<&str>, relationship_types: Option<&[String]>) -> Result<Vec<FileRelationship>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM file_relationships WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(source_file_id) = source_file_id {
            query.push_str(" AND source_file_id = ?");
            binds.push(source_file_id);
        }
        
        if let Some(target_file_id) = target_file_id {
            query.push_str(" AND target_file_id = ?");
            binds.push(target_file_id);
        }
        
        if let Some(types) = relationship_types {
            if !types.is_empty() {
                query.push_str(" AND relationship_type IN (");
                query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut relationships = Vec::new();
        for row in rows {
            relationships.push(FileRelationship {
                id: row.get("id"),
                source_file_id: row.get("source_file_id"),
                target_file_id: row.get("target_file_id"),
                relationship_type: row.get("relationship_type"),
                weight: row.get("weight"),
                created_at: row.get("created_at"),
            });
        }
        
        Ok(relationships)
    }

    pub async fn create_indexing_status(&self, status: IndexingStatus) -> Result<IndexingStatus, sqlx::Error> {
        let query = r#"
            INSERT INTO indexing_status (id, workspace_id, project_id, status, progress, total_files, processed_files, last_updated, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&status.id)
            .bind(&status.workspace_id)
            .bind(&status.project_id)
            .bind(&status.status)
            .bind(&status.progress)
            .bind(&status.total_files)
            .bind(&status.processed_files)
            .bind(&status.last_updated)
            .bind(&status.error_message)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(IndexingStatus {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            total_files: row.get("total_files"),
            processed_files: row.get("processed_files"),
            last_updated: row.get("last_updated"),
            error_message: row.get("error_message"),
        })
    }

    pub async fn get_indexing_status(&self, workspace_id: &str, project_id: Option<&str>) -> Result<IndexingStatus, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM indexing_status WHERE workspace_id = ?
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
            
        Ok(IndexingStatus {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            total_files: row.get("total_files"),
            processed_files: row.get("processed_files"),
            last_updated: row.get("last_updated"),
            error_message: row.get("error_message"),
        })
    }

    pub async fn update_indexing_status(&self, id: &str, status: IndexingStatus) -> Result<IndexingStatus, sqlx::Error> {
        let query = r#"
            UPDATE indexing_status 
            SET workspace_id = ?, project_id = ?, status = ?, progress = ?, total_files = ?, processed_files = ?, last_updated = ?, error_message = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&status.workspace_id)
            .bind(&status.project_id)
            .bind(&status.status)
            .bind(&status.progress)
            .bind(&status.total_files)
            .bind(&status.processed_files)
            .bind(&status.last_updated)
            .bind(&status.error_message)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(IndexingStatus {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            project_id: row.get("project_id"),
            status: row.get("status"),
            progress: row.get("progress"),
            total_files: row.get("total_files"),
            processed_files: row.get("processed_files"),
            last_updated: row.get("last_updated"),
            error_message: row.get("error_message"),
        })
    }

    pub async fn search_files(&self, workspace_id: &str, query: &str, file_types: Option<&[String]>, limit: i32) -> Result<Vec<IndexedFile>, sqlx::Error> {
        let mut search_query = r#"
            SELECT * FROM indexed_files 
            WHERE workspace_id = ? AND (name LIKE ? OR path LIKE ?)
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![
            workspace_id,
            &format!("%{}%", query),
            &format!("%{}%", query)
        ];
        
        if let Some(types) = file_types {
            if !types.is_empty() {
                search_query.push_str(" AND file_type IN (");
                search_query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                search_query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        search_query.push_str(" ORDER BY created_at DESC LIMIT ?");
        binds.push(&limit);
        
        let rows = sqlx::query(&search_query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut files = Vec::new();
        for row in rows {
            files.push(IndexedFile {
                id: row.get("id"),
                workspace_id: row.get("workspace_id"),
                project_id: row.get("project_id"),
                path: row.get("path"),
                name: row.get("name"),
                size: row.get("size"),
                file_type: row.get("file_type"),
                created_at: row.get("created_at"),
                modified_at: row.get("modified_at"),
                metadata: row.get("metadata"),
            });
        }
        
        Ok(files)
    }

    // New code intelligence methods
    pub async fn create_code_symbol(&self, symbol: CodeSymbol) -> Result<CodeSymbol, sqlx::Error> {
        let query = r#"
            INSERT INTO code_symbols (id, file_id, name, symbol_type, start_line, end_line, signature, documentation, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&symbol.id)
            .bind(&symbol.file_id)
            .bind(&symbol.name)
            .bind(&symbol.symbol_type)
            .bind(&symbol.start_line)
            .bind(&symbol.end_line)
            .bind(&symbol.signature)
            .bind(&symbol.documentation)
            .bind(&symbol.created_at)
            .bind(&symbol.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(CodeSymbol {
            id: row.get("id"),
            file_id: row.get("file_id"),
            name: row.get("name"),
            symbol_type: row.get("symbol_type"),
            start_line: row.get("start_line"),
            end_line: row.get("end_line"),
            signature: row.get("signature"),
            documentation: row.get("documentation"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_code_symbol(&self, id: &str) -> Result<CodeSymbol, sqlx::Error> {
        let query = r#"
            SELECT * FROM code_symbols WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(CodeSymbol {
            id: row.get("id"),
            file_id: row.get("file_id"),
            name: row.get("name"),
            symbol_type: row.get("symbol_type"),
            start_line: row.get("start_line"),
            end_line: row.get("end_line"),
            signature: row.get("signature"),
            documentation: row.get("documentation"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_code_symbols(&self, file_id: &str) -> Result<Vec<CodeSymbol>, sqlx::Error> {
        let query = r#"
            SELECT * FROM code_symbols WHERE file_id = ? ORDER BY start_line
        "#;
        
        let rows = sqlx::query(query)
            .bind(file_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut symbols = Vec::new();
        for row in rows {
            symbols.push(CodeSymbol {
                id: row.get("id"),
                file_id: row.get("file_id"),
                name: row.get("name"),
                symbol_type: row.get("symbol_type"),
                start_line: row.get("start_line"),
                end_line: row.get("end_line"),
                signature: row.get("signature"),
                documentation: row.get("documentation"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(symbols)
    }

    pub async fn create_code_relationship(&self, relationship: CodeRelationship) -> Result<CodeRelationship, sqlx::Error> {
        let query = r#"
            INSERT INTO code_relationships (id, source_symbol_id, target_symbol_id, relationship_type, weight, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&relationship.id)
            .bind(&relationship.source_symbol_id)
            .bind(&relationship.target_symbol_id)
            .bind(&relationship.relationship_type)
            .bind(&relationship.weight)
            .bind(&relationship.created_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(CodeRelationship {
            id: row.get("id"),
            source_symbol_id: row.get("source_symbol_id"),
            target_symbol_id: row.get("target_symbol_id"),
            relationship_type: row.get("relationship_type"),
            weight: row.get("weight"),
            created_at: row.get("created_at"),
        })
    }

    pub async fn get_code_relationships(&self, source_symbol_id: Option<&str>, target_symbol_id: Option<&str>, relationship_types: Option<&[String]>) -> Result<Vec<CodeRelationship>, sqlx::Error> {
        let mut query = r#"
            SELECT * FROM code_relationships WHERE 1=1
        "#.to_string();
        
        let mut binds: Vec<&dyn sqlx::Encode<sqlx::Sqlite> + Sync> = vec![];
        
        if let Some(source_symbol_id) = source_symbol_id {
            query.push_str(" AND source_symbol_id = ?");
            binds.push(source_symbol_id);
        }
        
        if let Some(target_symbol_id) = target_symbol_id {
            query.push_str(" AND target_symbol_id = ?");
            binds.push(target_symbol_id);
        }
        
        if let Some(types) = relationship_types {
            if !types.is_empty() {
                query.push_str(" AND relationship_type IN (");
                query.push_str(&types.iter().map(|_| "?").collect::<Vec<_>>().join(", "));
                query.push(')');
                binds.extend(types.iter().map(|s| s as &dyn sqlx::Encode<sqlx::Sqlite> + Sync));
            }
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query)
            .bind(&binds)
            .fetch_all(&self.pool)
            .await?;
            
        let mut relationships = Vec::new();
        for row in rows {
            relationships.push(CodeRelationship {
                id: row.get("id"),
                source_symbol_id: row.get("source_symbol_id"),
                target_symbol_id: row.get("target_symbol_id"),
                relationship_type: row.get("relationship_type"),
                weight: row.get("weight"),
                created_at: row.get("created_at"),
            });
        }
        
        Ok(relationships)
    }

    pub async fn create_code_analysis(&self, analysis: CodeAnalysis) -> Result<CodeAnalysis, sqlx::Error> {
        let query = r#"
            INSERT INTO code_analysis (id, file_id, project_id, analysis_type, result, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&analysis.id)
            .bind(&analysis.file_id)
            .bind(&analysis.project_id)
            .bind(&analysis.analysis_type)
            .bind(&analysis.result)
            .bind(&analysis.created_at)
            .bind(&analysis.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(CodeAnalysis {
            id: row.get("id"),
            file_id: row.get("file_id"),
            project_id: row.get("project_id"),
            analysis_type: row.get("analysis_type"),
            result: row.get("result"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_code_analysis(&self, file_id: &str, analysis_type: &str) -> Result<CodeAnalysis, sqlx::Error> {
        let query = r#"
            SELECT * FROM code_analysis WHERE file_id = ? AND analysis_type = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(file_id)
            .bind(analysis_type)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(CodeAnalysis {
            id: row.get("id"),
            file_id: row.get("file_id"),
            project_id: row.get("project_id"),
            analysis_type: row.get("analysis_type"),
            result: row.get("result"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_project_code_intelligence(&self, project_id: &str) -> Result<ProjectCodeIntelligence, sqlx::Error> {
        let query = r#"
            SELECT * FROM project_code_intelligence WHERE project_id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(project_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ProjectCodeIntelligence {
            id: row.get("id"),
            project_id: row.get("project_id"),
            symbol_count: row.get("symbol_count"),
            file_count: row.get("file_count"),
            average_complexity: row.get("average_complexity"),
            last_analyzed: row.get("last_analyzed"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_project_code_intelligence(&self, project_id: &str, intelligence: ProjectCodeIntelligence) -> Result<ProjectCodeIntelligence, sqlx::Error> {
        let query = r#"
            UPDATE project_code_intelligence 
            SET symbol_count = ?, file_count = ?, average_complexity = ?, last_analyzed = ?, updated_at = ?
            WHERE project_id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(&intelligence.symbol_count)
            .bind(&intelligence.file_count)
            .bind(&intelligence.average_complexity)
            .bind(&intelligence.last_analyzed)
            .bind(&intelligence.updated_at)
            .bind(project_id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(ProjectCodeIntelligence {
            id: row.get("id"),
            project_id: row.get("project_id"),
            symbol_count: row.get("symbol_count"),
            file_count: row.get("file_count"),
            average_complexity: row.get("average_complexity"),
            last_analyzed: row.get("last_analyzed"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}
