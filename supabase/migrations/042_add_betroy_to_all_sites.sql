-- Add BETROY link to all sites at position 2 (sort_order = 2)
-- This will shift existing actions with sort_order >= 2 to higher positions

-- First, update existing actions to make room for BETROY at position 2
-- Shift all actions with sort_order >= 2 by +1
UPDATE public.page_actions 
SET sort_order = sort_order + 1,
    updated_at = NOW()
WHERE sort_order >= 2;

-- Remove any existing BETROY actions to avoid duplicates
DELETE FROM public.page_actions 
WHERE UPPER(label) = 'BETROY' OR href LIKE '%betroy%';

-- Add BETROY action to all existing pages at sort_order = 2
INSERT INTO public.page_actions (
    page_id, 
    label, 
    href, 
    variant, 
    preset, 
    description,
    sort_order, 
    is_enabled,
    created_at,
    updated_at
)
SELECT 
    p.id as page_id,
    'BETROY' as label,
    'https://betroy.link/simgeaff' as href,
    'outline'::action_variant as variant,
    'outline-blue' as preset,
    'BETROY - Premium Gaming Platform' as description,
    2 as sort_order,
    true as is_enabled,
    NOW() as created_at,
    NOW() as updated_at
FROM public.pages p
WHERE p.is_enabled = true;

-- Log the operation
DO $$
DECLARE
    pages_count INTEGER;
    actions_added INTEGER;
BEGIN
    -- Count total pages
    SELECT COUNT(*) INTO pages_count 
    FROM public.pages 
    WHERE is_enabled = true;
    
    -- Count BETROY actions added
    SELECT COUNT(*) INTO actions_added 
    FROM public.page_actions 
    WHERE label = 'BETROY' AND href = 'https://betroy.link/simgeaff';
    
    -- Log the results
    RAISE NOTICE 'BETROY link addition completed:';
    RAISE NOTICE '- Total active pages: %', pages_count;
    RAISE NOTICE '- BETROY actions added: %', actions_added;
    RAISE NOTICE '- Position: 2nd (sort_order = 2)';
    RAISE NOTICE '- Link: https://betroy.link/simgeaff';
    RAISE NOTICE '- Existing actions with sort_order >= 2 have been shifted up by 1';
END $$;