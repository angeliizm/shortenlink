-- Create page_action_styles table for custom button colors
CREATE TABLE IF NOT EXISTS public.page_action_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES public.page_actions(id) ON DELETE CASCADE UNIQUE,
    bg_color TEXT NULL CHECK (bg_color IS NULL OR bg_color ~ '^#[0-9A-Fa-f]{6}$'),
    text_color TEXT NULL CHECK (text_color IS NULL OR text_color ~ '^#[0-9A-Fa-f]{6}$'),
    border_color TEXT NULL CHECK (border_color IS NULL OR border_color ~ '^#[0-9A-Fa-f]{6}$'),
    hover_bg_color TEXT NULL CHECK (hover_bg_color IS NULL OR hover_bg_color ~ '^#[0-9A-Fa-f]{6}$'),
    hover_text_color TEXT NULL CHECK (hover_text_color IS NULL OR hover_text_color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_page_action_styles_action_id ON public.page_action_styles(action_id);

-- Enable RLS
ALTER TABLE public.page_action_styles ENABLE ROW LEVEL SECURITY;

-- RLS policies - inherit from page_actions ownership
CREATE POLICY "Users can view styles for their own actions"
    ON public.page_action_styles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.page_actions pa
            JOIN public.pages p ON pa.page_id = p.id
            WHERE pa.id = page_action_styles.action_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create styles for their own actions"
    ON public.page_action_styles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.page_actions pa
            JOIN public.pages p ON pa.page_id = p.id
            WHERE pa.id = page_action_styles.action_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update styles for their own actions"
    ON public.page_action_styles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.page_actions pa
            JOIN public.pages p ON pa.page_id = p.id
            WHERE pa.id = page_action_styles.action_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete styles for their own actions"
    ON public.page_action_styles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.page_actions pa
            JOIN public.pages p ON pa.page_id = p.id
            WHERE pa.id = page_action_styles.action_id
            AND p.owner_id = auth.uid()
        )
    );

-- Public users can view styles for enabled actions on enabled pages
CREATE POLICY "Public can view styles for enabled actions"
    ON public.page_action_styles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.page_actions pa
            JOIN public.pages p ON pa.page_id = p.id
            WHERE pa.id = page_action_styles.action_id
            AND p.is_enabled = true
            AND pa.is_enabled = true
        )
    );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_page_action_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_page_action_styles_updated_at
    BEFORE UPDATE ON public.page_action_styles
    FOR EACH ROW
    EXECUTE FUNCTION update_page_action_styles_updated_at();