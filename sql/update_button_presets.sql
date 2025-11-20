-- Update button presets based on label text
-- This script updates all buttons with "SHERATON" in the label to use "sheraton-banner" preset
-- and all buttons with "VAYCASİNO" or "VAYCASINO" in the label to use "vaycasino-banner" preset

-- Update SHERATON buttons to sheraton-banner preset
UPDATE public.page_actions 
SET preset = 'sheraton-banner',
    updated_at = NOW()
WHERE UPPER(label) LIKE '%SHERATON%';

-- Update VAYCASİNO/VAYCASINO buttons to vaycasino-banner preset
UPDATE public.page_actions 
SET preset = 'vaycasino-banner',
    updated_at = NOW()
WHERE UPPER(label) LIKE '%VAYCASİNO%' 
   OR UPPER(label) LIKE '%VAYCASINO%';

-- Show the results
SELECT 
    id,
    label,
    preset,
    updated_at
FROM public.page_actions 
WHERE preset IN ('sheraton-banner', 'vaycasino-banner')
ORDER BY preset, label;
