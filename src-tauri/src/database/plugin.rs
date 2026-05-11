use sqlx::{SqlitePool, Row};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Plugin {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub is_active: bool,
    pub is_system: bool,
    pub capabilities: String,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginSetting {
    pub id: String,
    pub plugin_id: String,
    pub key: String,
    pub value: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PluginCapability {
    pub id: String,
    pub plugin_id: String,
    pub capability: String,
    pub is_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub struct PluginDatabase {
    pool: SqlitePool,
}

impl PluginDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        PluginDatabase { pool }
    }

    pub async fn create_plugin(&self, plugin: Plugin) -> Result<Plugin, sqlx::Error> {
        let query = r#"
            INSERT INTO plugins (id, name, version, description, author, is_active, is_system, capabilities, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(plugin.id)
            .bind(plugin.name)
            .bind(plugin.version)
            .bind(plugin.description)
            .bind(plugin.author)
            .bind(plugin.is_active)
            .bind(plugin.is_system)
            .bind(plugin.capabilities)
            .bind(plugin.config)
            .bind(plugin.created_at)
            .bind(plugin.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Plugin {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            capabilities: row.get("capabilities"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_plugin(&self, id: &str) -> Result<Plugin, sqlx::Error> {
        let query = r#"
            SELECT * FROM plugins WHERE id = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Plugin {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            capabilities: row.get("capabilities"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_plugins(&self) -> Result<Vec<Plugin>, sqlx::Error> {
        let query = r#"
            SELECT * FROM plugins ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .fetch_all(&self.pool)
            .await?;
            
        let mut plugins = Vec::new();
        for row in rows {
            plugins.push(Plugin {
                id: row.get("id"),
                name: row.get("name"),
                version: row.get("version"),
                description: row.get("description"),
                author: row.get("author"),
                is_active: row.get("is_active"),
                is_system: row.get("is_system"),
                capabilities: row.get("capabilities"),
                config: row.get("config"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(plugins)
    }

    pub async fn update_plugin(&self, id: &str, plugin: Plugin) -> Result<Plugin, sqlx::Error> {
        let query = r#"
            UPDATE plugins 
            SET name = ?, version = ?, description = ?, author = ?, is_active = ?, is_system = ?, capabilities = ?, config = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(plugin.name)
            .bind(plugin.version)
            .bind(plugin.description)
            .bind(plugin.author)
            .bind(plugin.is_active)
            .bind(plugin.is_system)
            .bind(plugin.capabilities)
            .bind(plugin.config)
            .bind(plugin.updated_at)
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(Plugin {
            id: row.get("id"),
            name: row.get("name"),
            version: row.get("version"),
            description: row.get("description"),
            author: row.get("author"),
            is_active: row.get("is_active"),
            is_system: row.get("is_system"),
            capabilities: row.get("capabilities"),
            config: row.get("config"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_plugin(&self, id: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            DELETE FROM plugins WHERE id = ?
        "#;
        
        sqlx::query(query)
            .bind(id)
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    pub async fn create_plugin_setting(&self, setting: PluginSetting) -> Result<PluginSetting, sqlx::Error> {
        let query = r#"
            INSERT INTO plugin_settings (id, plugin_id, key, value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(setting.id)
            .bind(setting.plugin_id)
            .bind(setting.key)
            .bind(setting.value)
            .bind(setting.created_at)
            .bind(setting.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(PluginSetting {
            id: row.get("id"),
            plugin_id: row.get("plugin_id"),
            key: row.get("key"),
            value: row.get("value"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_plugin_settings(&self, plugin_id: &str) -> Result<Vec<PluginSetting>, sqlx::Error> {
        let query = r#"
            SELECT * FROM plugin_settings WHERE plugin_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(plugin_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut settings = Vec::new();
        for row in rows {
            settings.push(PluginSetting {
                id: row.get("id"),
                plugin_id: row.get("plugin_id"),
                key: row.get("key"),
                value: row.get("value"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(settings)
    }

    pub async fn get_plugin_setting(&self, plugin_id: &str, key: &str) -> Result<Option<PluginSetting>, sqlx::Error> {
        let query = r#"
            SELECT * FROM plugin_settings WHERE plugin_id = ? AND key = ?
        "#;
        
        let row = sqlx::query(query)
            .bind(plugin_id)
            .bind(key)
            .fetch_one(&self.pool)
            .await;
            
        match row {
            Ok(row) => Ok(Some(PluginSetting {
                id: row.get("id"),
                plugin_id: row.get("plugin_id"),
                key: row.get("key"),
                value: row.get("value"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })),
            Err(_) => Ok(None),
        }
    }

    pub async fn update_plugin_setting(&self, id: &str, value: &str) -> Result<PluginSetting, sqlx::Error> {
        let query = r#"
            UPDATE plugin_settings 
            SET value = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(value)
            .bind(chrono::Utc::now().to_rfc3339())
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(PluginSetting {
            id: row.get("id"),
            plugin_id: row.get("plugin_id"),
            key: row.get("key"),
            value: row.get("value"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn create_plugin_capability(&self, capability: PluginCapability) -> Result<PluginCapability, sqlx::Error> {
        let query = r#"
            INSERT INTO plugin_capabilities (id, plugin_id, capability, is_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        "#;
        
        let row = sqlx::query(query)
            .bind(capability.id)
            .bind(capability.plugin_id)
            .bind(capability.capability)
            .bind(capability.is_enabled)
            .bind(capability.created_at)
            .bind(capability.updated_at)
            .fetch_one(&self.pool)
            .await?;
            
        Ok(PluginCapability {
            id: row.get("id"),
            plugin_id: row.get("plugin_id"),
            capability: row.get("capability"),
            is_enabled: row.get("is_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_plugin_capabilities(&self, plugin_id: &str) -> Result<Vec<PluginCapability>, sqlx::Error> {
        let query = r#"
            SELECT * FROM plugin_capabilities WHERE plugin_id = ? ORDER BY created_at DESC
        "#;
        
        let rows = sqlx::query(query)
            .bind(plugin_id)
            .fetch_all(&self.pool)
            .await?;
            
        let mut capabilities = Vec::new();
        for row in rows {
            capabilities.push(PluginCapability {
                id: row.get("id"),
                plugin_id: row.get("plugin_id"),
                capability: row.get("capability"),
                is_enabled: row.get("is_enabled"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        
        Ok(capabilities)
    }

    pub async fn update_plugin_capability(&self, id: &str, is_enabled: bool) -> Result<PluginCapability, sqlx::Error> {
        let query = r#"
            UPDATE plugin_capabilities 
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
            
        Ok(PluginCapability {
            id: row.get("id"),
            plugin_id: row.get("plugin_id"),
            capability: row.get("capability"),
            is_enabled: row.get("is_enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}
