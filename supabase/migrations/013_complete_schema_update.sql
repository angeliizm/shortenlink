-- Complete schema update for pages, actions, and avatar support
-- This migration includes all necessary tables and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE action_variant AS ENUM ('primary', 'outline', 'ghost');
CREATE TYPE domain_status AS ENUM ('pending', 'verified', 'failed');

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  brand_color TEXT NOT NULL DEFAULT '#000000',
  accent_color TEXT DEFAULT '#f9fafb',
  target_url TEXT NOT NULL,
  avatar_url TEXT,
  meta JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_site_slug CHECK (site_slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_brand_color CHECK (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  CONSTRAINT valid_accent_color CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9a-fA-F]{6}$'),
  CONSTRAINT valid_avatar_url CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://')
);

-- Create page_actions table
CREATE TABLE IF NOT EXISTS public.page_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  variant action_variant DEFAULT 'outline',
  preset TEXT DEFAULT 'outline-gray',
  sort_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_href CHECK (href ~ '^https?://')
);

-- Create custom_domains table
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL UNIQUE,
  status domain_status DEFAULT 'pending',
  dns_txt TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_hostname CHECK (hostname ~ '^[a-z0-9.-]+$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_site_slug ON public.pages(site_slug) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_pages_owner_id ON public.pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_page_actions_page_id ON public.page_actions(page_id) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_page_actions_sort_order ON public.page_actions(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_custom_domains_hostname ON public.custom_domains(hostname) WHERE status = 'verified';
CREATE INDEX IF NOT EXISTS idx_custom_domains_page_id ON public.custom_domains(page_id);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read enabled pages" ON public.pages;
DROP POLICY IF EXISTS "Owners view own pages" ON public.pages;
DROP POLICY IF EXISTS "Owners insert own pages" ON public.pages;
DROP POLICY IF EXISTS "Owners update own pages" ON public.pages;
DROP POLICY IF EXISTS "Owners delete own pages" ON public.pages;

DROP POLICY IF EXISTS "Public read enabled actions" ON public.page_actions;
DROP POLICY IF EXISTS "Owners view own actions" ON public.page_actions;
DROP POLICY IF EXISTS "Owners insert own actions" ON public.page_actions;
DROP POLICY IF EXISTS "Owners update own actions" ON public.page_actions;
DROP POLICY IF EXISTS "Owners delete own actions" ON public.page_actions;

DROP POLICY IF EXISTS "Public read verified domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Owners view own domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Owners manage own domains" ON public.custom_domains;

-- RLS Policies for pages
-- Public can read enabled pages
CREATE POLICY "Public read enabled pages" ON public.pages
  FOR SELECT USING (is_enabled = true);

-- Owners can view all their pages
CREATE POLICY "Owners view own pages" ON public.pages
  FOR SELECT USING (auth.uid() = owner_id);

-- Owners can insert their own pages
CREATE POLICY "Owners insert own pages" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own pages
CREATE POLICY "Owners update own pages" ON public.pages
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own pages
CREATE POLICY "Owners delete own pages" ON public.pages
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for page_actions
-- Public can read enabled actions for enabled pages
CREATE POLICY "Public read enabled actions" ON public.page_actions
  FOR SELECT USING (
    is_enabled = true AND 
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_actions.page_id 
      AND pages.is_enabled = true
    )
  );

-- Owners can view all their page actions
CREATE POLICY "Owners view own actions" ON public.page_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_actions.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can insert actions for their pages
CREATE POLICY "Owners insert own actions" ON public.page_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_actions.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can update actions for their pages
CREATE POLICY "Owners update own actions" ON public.page_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_actions.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can delete actions for their pages
CREATE POLICY "Owners delete own actions" ON public.page_actions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_actions.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- RLS Policies for custom_domains
-- Public can read verified domains
CREATE POLICY "Public read verified domains" ON public.custom_domains
  FOR SELECT USING (status = 'verified');

-- Owners can view all their domains
CREATE POLICY "Owners view own domains" ON public.custom_domains
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = custom_domains.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can manage their domains
CREATE POLICY "Owners manage own domains" ON public.custom_domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = custom_domains.page_id 
      AND pages.owner_id = auth.uid()
    )
  );

-- Create views
CREATE OR REPLACE VIEW public.pages_with_actions AS
SELECT 
  p.id,
  p.site_slug,
  p.title,
  p.brand_color,
  p.accent_color,
  p.target_url,
  p.avatar_url,
  p.meta,
  p.is_enabled,
  p.created_at,
  p.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', a.id,
        'label', a.label,
        'href', a.href,
        'variant', a.variant,
        'preset', a.preset,
        'sortOrder', a.sort_order,
        'isEnabled', a.is_enabled
      ) ORDER BY a.sort_order
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::json
  ) AS actions
FROM public.pages p
LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
WHERE p.is_enabled = true
GROUP BY p.id;

-- Grant permissions to views
GRANT SELECT ON public.pages_with_actions TO anon, authenticated;

-- Create RPC functions
CREATE OR REPLACE FUNCTION public.get_page_by_slug(site_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'site_slug', p.site_slug,
    'title', p.title,
    'brand_color', p.brand_color,
    'accent_color', p.accent_color,
    'target_url', p.target_url,
    'avatar_url', p.avatar_url,
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'preset', a.preset,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.pages p
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  WHERE p.site_slug = get_page_by_slug.site_slug
    AND p.is_enabled = true
  GROUP BY p.id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_page_by_domain(hostname TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'site_slug', p.site_slug,
    'title', p.title,
    'brand_color', p.brand_color,
    'accent_color', p.accent_color,
    'target_url', p.target_url,
    'avatar_url', p.avatar_url,
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'custom_domain', d.hostname,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'preset', a.preset,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.custom_domains d
  INNER JOIN public.pages p ON d.page_id = p.id
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  WHERE d.hostname = get_page_by_domain.hostname
    AND d.status = 'verified'
    AND p.is_enabled = true
  GROUP BY p.id, d.hostname;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_page(
  p_id UUID DEFAULT NULL,
  p_site_slug TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_brand_color TEXT DEFAULT NULL,
  p_accent_color TEXT DEFAULT NULL,
  p_target_url TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT NULL,
  p_is_enabled BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_id UUID;
BEGIN
  IF p_id IS NULL THEN
    -- Insert new page
    INSERT INTO public.pages (
      site_slug, title, brand_color, accent_color, 
      target_url, avatar_url, meta, is_enabled, owner_id
    )
    VALUES (
      p_site_slug, p_title, p_brand_color, p_accent_color,
      p_target_url, p_avatar_url, COALESCE(p_meta, '{}'::jsonb), COALESCE(p_is_enabled, true), auth.uid()
    )
    RETURNING id INTO page_id;
  ELSE
    -- Update existing page (only if owner)
    UPDATE public.pages
    SET
      site_slug = COALESCE(p_site_slug, site_slug),
      title = COALESCE(p_title, title),
      brand_color = COALESCE(p_brand_color, brand_color),
      accent_color = COALESCE(p_accent_color, accent_color),
      target_url = COALESCE(p_target_url, target_url),
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      meta = COALESCE(p_meta, meta),
      is_enabled = COALESCE(p_is_enabled, is_enabled),
      updated_at = NOW()
    WHERE id = p_id AND owner_id = auth.uid()
    RETURNING id INTO page_id;
  END IF;
  
  RETURN page_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_action(
  p_id UUID DEFAULT NULL,
  p_page_id UUID DEFAULT NULL,
  p_label TEXT DEFAULT NULL,
  p_href TEXT DEFAULT NULL,
  p_variant action_variant DEFAULT NULL,
  p_preset TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL,
  p_is_enabled BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
  page_owner UUID;
BEGIN
  -- Check ownership
  SELECT owner_id INTO page_owner
  FROM public.pages
  WHERE id = p_page_id;
  
  IF page_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  IF p_id IS NULL THEN
    -- Insert new action
    INSERT INTO public.page_actions (
      page_id, label, href, variant, preset, sort_order, is_enabled
    )
    VALUES (
      p_page_id, p_label, p_href, 
      COALESCE(p_variant, 'outline'::action_variant),
      COALESCE(p_preset, 'outline-gray'),
      COALESCE(p_sort_order, 0),
      COALESCE(p_is_enabled, true)
    )
    RETURNING id INTO action_id;
  ELSE
    -- Update existing action
    UPDATE public.page_actions
    SET
      label = COALESCE(p_label, label),
      href = COALESCE(p_href, href),
      variant = COALESCE(p_variant, variant),
      preset = COALESCE(p_preset, preset),
      sort_order = COALESCE(p_sort_order, sort_order),
      is_enabled = COALESCE(p_is_enabled, is_enabled),
      updated_at = NOW()
    WHERE id = p_id AND page_id = p_page_id
    RETURNING id INTO action_id;
  END IF;
  
  RETURN action_id;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_page_by_slug TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_page_by_domain TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_page TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_action TO authenticated;

-- Create triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
DROP TRIGGER IF EXISTS update_page_actions_updated_at ON public.page_actions;
DROP TRIGGER IF EXISTS update_custom_domains_updated_at ON public.custom_domains;
DROP TRIGGER IF EXISTS normalize_page_slug ON public.pages;

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_page_actions_updated_at
  BEFORE UPDATE ON public.page_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Slug normalization trigger
CREATE OR REPLACE FUNCTION public.normalize_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.site_slug = LOWER(TRIM(NEW.site_slug));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_page_slug
  BEFORE INSERT OR UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.normalize_slug();

-- Storage bucket for page assets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES (
  'page-assets',
  'page-assets',
  true,
  false,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read page assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload page assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners update page assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete page assets" ON storage.objects;

-- Storage policies
CREATE POLICY "Public read page assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'page-assets');

CREATE POLICY "Owners upload page assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'page-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners update page assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'page-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners delete page assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'page-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Seed data (optional - remove if you don't want demo data)
DO $$
DECLARE
  demo_user_id UUID;
  demo_page_id UUID;
  casino_page_id UUID;
BEGIN
  -- Create a demo user if not exists
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';

  IF demo_user_id IS NULL THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      uuid_generate_v4(),
      'demo@example.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING id INTO demo_user_id;
  END IF;
  
  -- Insert demo page (embeddable)
  INSERT INTO public.pages (
    site_slug, title, brand_color, accent_color, 
    target_url, meta, is_enabled, owner_id
  )
  VALUES (
    'demo',
    'Demo Embeddable Site',
    '#3B82F6',
    '#EFF6FF',
    'Welcome to our amazing platform',
    '{"description": "A demo page showing embeddable content", "noindex": false}'::jsonb,
    true,
    demo_user_id
  )
  ON CONFLICT (site_slug) DO NOTHING
  RETURNING id INTO demo_page_id;
  
  -- Insert actions for demo page
  INSERT INTO public.page_actions (page_id, label, href, variant, preset, sort_order, is_enabled)
  VALUES 
    (demo_page_id, 'Documentation', 'https://docs.example.com', 'outline', 'outline-blue', 1, true),
    (demo_page_id, 'GitHub', 'https://github.com', 'ghost', 'ghost-gray', 2, true),
    (demo_page_id, 'Contact', 'https://example.com/contact', 'primary', 'primary-blue', 3, true)
  ON CONFLICT DO NOTHING;
  
  -- Insert casino page (likely non-embeddable)
  INSERT INTO public.pages (
    site_slug, title, brand_color, accent_color, 
    target_url, meta, is_enabled, owner_id
  )
  VALUES (
    'casinofikret',
    'Casino Fikret',
    '#DC2626',
    '#FEF2F2',
    'Premium Gaming Experience - Play Now!',
    '{"description": "Premium gaming experience", "noindex": true}'::jsonb,
    true,
    demo_user_id
  )
  ON CONFLICT (site_slug) DO NOTHING
  RETURNING id INTO casino_page_id;
  
  -- Insert actions for casino page
  INSERT INTO public.page_actions (page_id, label, href, variant, preset, sort_order, is_enabled)
  VALUES 
    (casino_page_id, 'Register Now', 'https://www.bet365.com/register', 'primary', 'primary-red', 1, true),
    (casino_page_id, 'Promotions', 'https://www.bet365.com/promotions', 'outline', 'outline-red', 2, true),
    (casino_page_id, 'Live Casino', 'https://www.bet365.com/live', 'outline', 'outline-red', 3, true),
    (casino_page_id, 'Support', 'https://www.bet365.com/help', 'ghost', 'ghost-gray', 4, true)
  ON CONFLICT DO NOTHING;
END $$;
