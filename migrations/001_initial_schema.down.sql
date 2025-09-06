-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_links_updated_at ON links;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_links_domain_slug;
DROP INDEX IF EXISTS idx_links_user_id;
DROP INDEX IF EXISTS idx_links_expires_at;
DROP INDEX IF EXISTS idx_links_active;
DROP INDEX IF EXISTS idx_links_created_at;
DROP INDEX IF EXISTS idx_links_recent;

DROP INDEX IF EXISTS idx_clicks_link_created;
DROP INDEX IF EXISTS idx_clicks_created_at;
DROP INDEX IF EXISTS idx_clicks_country;
DROP INDEX IF EXISTS idx_clicks_not_bot;
DROP INDEX IF EXISTS idx_clicks_today;

DROP INDEX IF EXISTS idx_sessions_expires;
DROP INDEX IF EXISTS idx_sessions_user;

DROP INDEX IF EXISTS idx_abuse_status;
DROP INDEX IF EXISTS idx_audit_user_created;
DROP INDEX IF EXISTS idx_audit_correlation;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS abuse_reports CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS clicks CASCADE;
DROP TABLE IF EXISTS link_tags CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "pg_trgm";
DROP EXTENSION IF EXISTS "uuid-ossp";