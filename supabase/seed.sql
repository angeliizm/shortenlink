-- Seed file for Supabase development
-- This file contains test data for local development

-- Insert test user (password: testpassword123)
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    NOW(),
    crypt('testpassword123', gen_salt('bf')),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "user"}',
    NOW(),
    NOW()
);

-- Insert admin user (password: adminpassword123)
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'admin@example.com',
    NOW(),
    crypt('adminpassword123', gen_salt('bf')),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    NOW(),
    NOW()
);

-- Insert test domain
INSERT INTO public.domains (id, user_id, domain, verified, verification_txt, ssl_status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'localhost:3000',
    true,
    'dev-verification',
    'active'
);

-- Insert sample links
INSERT INTO public.links (user_id, domain_id, slug, target_url, title)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'github', 'https://github.com', 'GitHub'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'google', 'https://google.com', 'Google'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'docs', 'https://supabase.com/docs', 'Supabase Docs');