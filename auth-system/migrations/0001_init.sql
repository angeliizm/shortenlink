-- Migration: 0001_init.sql
-- Description: Initial database schema for authentication system
-- Author: Generated with Claude Code
-- Date: 2025-01-16

-- Enable UUID extension for better token generation (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create sessions table (optional, for additional session tracking)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_id ON sessions(token_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create a cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert a sample admin user (optional, remove in production)
-- Password is 'password123' hashed with Argon2id
-- INSERT INTO users (email, password) VALUES (
--     'admin@example.com',
--     '$argon2id$v=19$m=65536,t=1,p=4$c2FsdA==$hash_here'
-- );

-- Grant appropriate permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO auth_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO auth_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO auth_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE sessions_id_seq TO auth_app_user;