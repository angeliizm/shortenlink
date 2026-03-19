-- Remove all sites except BETROY, AMG, LOCA, HUQQA, ONWİN
-- This migration will delete pages and their related data for all sites except the allowed ones

-- First, let's create a backup table to store deleted data (optional, for safety)
CREATE TABLE IF NOT EXISTS public.deleted_pages_backup AS
SELECT * FROM public.pages WHERE 1=0;

CREATE TABLE IF NOT EXISTS public.deleted_page_actions_backup AS
SELECT * FROM public.page_actions WHERE 1=0;

CREATE TABLE IF NOT EXISTS public.deleted_custom_domains_backup AS
SELECT * FROM public.custom_domains WHERE 1=0;

-- Backup data before deletion (optional safety measure)
INSERT INTO public.deleted_pages_backup
SELECT * FROM public.pages 
WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN');

INSERT INTO public.deleted_page_actions_backup
SELECT pa.* FROM public.page_actions pa
INNER JOIN public.pages p ON pa.page_id = p.id
WHERE UPPER(p.site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN');

INSERT INTO public.deleted_custom_domains_backup
SELECT cd.* FROM public.custom_domains cd
INNER JOIN public.pages p ON cd.page_id = p.id
WHERE UPPER(p.site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN');

-- Delete custom domains for pages that will be removed
DELETE FROM public.custom_domains 
WHERE page_id IN (
    SELECT id FROM public.pages 
    WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
);

-- Delete page actions for pages that will be removed
DELETE FROM public.page_actions 
WHERE page_id IN (
    SELECT id FROM public.pages 
    WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
);

-- Delete analytics data if exists (from analytics schema)
-- Check if analytics tables exist and delete related data
DO $$
BEGIN
    -- Delete page views for removed pages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_views' AND table_schema = 'public') THEN
        DELETE FROM public.page_views 
        WHERE page_id IN (
            SELECT id FROM public.pages 
            WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
        );
    END IF;

    -- Delete action clicks for removed pages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'action_clicks' AND table_schema = 'public') THEN
        DELETE FROM public.action_clicks 
        WHERE page_id IN (
            SELECT id FROM public.pages 
            WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
        );
    END IF;

    -- Delete visitor sessions for removed pages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visitor_sessions' AND table_schema = 'public') THEN
        DELETE FROM public.visitor_sessions 
        WHERE page_id IN (
            SELECT id FROM public.pages 
            WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
        );
    END IF;
END $$;

-- Delete site permissions for removed pages
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_permissions' AND table_schema = 'public') THEN
        DELETE FROM public.site_permissions 
        WHERE site_slug NOT IN (
            SELECT site_slug FROM public.pages 
            WHERE UPPER(site_slug) IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN')
        );
    END IF;
END $$;

-- Finally, delete the pages themselves
-- This will cascade delete any remaining related data due to foreign key constraints
DELETE FROM public.pages 
WHERE UPPER(site_slug) NOT IN ('BETROY', 'AMG', 'LOCA', 'HUQQA', 'ONWIN');

-- Log the operation
DO $$
DECLARE
    remaining_count INTEGER;
    deleted_count INTEGER;
BEGIN
    -- Count remaining pages
    SELECT COUNT(*) INTO remaining_count FROM public.pages;
    
    -- Count deleted pages from backup
    SELECT COUNT(*) INTO deleted_count FROM public.deleted_pages_backup;
    
    -- Log the results
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Deleted % pages', deleted_count;
    RAISE NOTICE '- Remaining % pages', remaining_count;
    RAISE NOTICE '- Allowed sites: BETROY, AMG, LOCA, HUQQA, ONWIN';
END $$;

-- Optional: Clean up backup tables after verification
-- Uncomment the following lines if you want to remove backup tables after confirming the migration
-- DROP TABLE IF EXISTS public.deleted_pages_backup;
-- DROP TABLE IF EXISTS public.deleted_page_actions_backup;
-- DROP TABLE IF EXISTS public.deleted_custom_domains_backup;